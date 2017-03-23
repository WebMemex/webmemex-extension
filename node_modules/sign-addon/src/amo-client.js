import deepcopy from "deepcopy";
import {default as defaultFs} from "fs";
import url from "url";
import path from "path";
import defaultJwt from "jsonwebtoken";
import {default as defaultRequest} from "request";
import when from "when";
import nodefn from "when/node";

const defaultSetInterval = setInterval;
const defaultClearInterval = clearInterval;

/**
 * Construct a new addons.mozilla.org API client.
 *
 * @param {Object} conf
 *   - `apiKey`: API key string from the Developer Hub.
 *   - `apiSecret`: API secret string from the Developer Hub.
 *   - `apiUrlPrefix`: API URL prefix, including any leading paths.
 *   - `apiJwtExpiresIn`: Number of seconds until the JWT token for the API
 *     request expires. This must match the expiration time that the API
 *     server accepts.
 *   - `signedStatusCheckInterval`: A period in millesconds between
 *     checks when waiting on add-on signing.
 *   - `signedStatusCheckTimeout`: A length in millesconds to give up
 *      if the add-on hasn't been signed.
 *   - `debugLogging`: When true, log more information
 *   - `downloadDir`: Absolute path to save downloaded files to.
 *     The working directory will be used by default.
 *   - `proxyServer`: Optional proxy server to use for all requests,
 *     such as "http://yourproxy:6000"
 *   - `requestConfig`: Optional configuration object to pass to
 *     request(). Not all parameters are guaranteed to be applied.
 */
export class Client {
  constructor({apiKey,
               apiSecret,
               apiUrlPrefix,
               // TODO: put this back to something sane after we
               // address the file upload issue on AMO:
               // https://github.com/mozilla/addons-server/issues/3688
               apiJwtExpiresIn=60 * 5,  // 5 minutes
               debugLogging=false,
               signedStatusCheckInterval=1000,
               signedStatusCheckTimeout=120000,  // 2 minutes.
               logger=console,
               downloadDir=process.cwd(),
               fs=defaultFs,
               request=defaultRequest,
               proxyServer,
               requestConfig,
               validateProgress}) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.apiUrlPrefix = apiUrlPrefix;  // default set in CLI options.
    this.apiJwtExpiresIn = apiJwtExpiresIn;
    this.signedStatusCheckInterval = signedStatusCheckInterval;
    this.signedStatusCheckTimeout = signedStatusCheckTimeout;
    this.debugLogging = debugLogging;
    this.logger = logger;
    this.downloadDir = downloadDir;
    this.proxyServer = proxyServer;
    this.requestConfig = requestConfig || {};

    // Set up external dependencies, allowing for overrides.
    this._validateProgress = validateProgress || new PseudoProgress({
      preamble: "Validating add-on",
    });
    this._fs = fs;
    this._request = request;
  }

  /**
   * Sign a new version of your add-on at addons.mozilla.org.
   *
   * @param {Object} conf
   *   - `xpiPath` Path to xpi file.
   *   - `guid` Optional add-on GUID, aka the ID in install.rdf.
   *   - `version` add-on version string.
   * @return {Promise} signingResult with keys:
   *   - success: boolean
   *   - downloadedFiles: Array of file objects
   *   - id: string identifier for the signed add-on
   */
  sign({guid, version, xpiPath}) {

    const formData = {
      upload: this._fs.createReadStream(xpiPath),
    };
    let addonUrl = "/addons/";
    let method = "put";
    if (guid) {
      // PUT to a specific URL for this add-on + version.
      addonUrl += encodeURIComponent(guid) +
        "/versions/" + encodeURIComponent(version) + "/";
    } else {
      // POST to a generic URL to create a new add-on.
      this.debug("Signing add-on without an ID");
      method = "post";
      formData.version = version;
    }

    const doRequest = this[method].bind(this);

    return doRequest({
      url: addonUrl, formData,
    }, {
      throwOnBadResponse: false,
    }).then((responseResult) => {
      const httpResponse = responseResult[0] || {};
      const response = responseResult[1] || {};

      const acceptableStatuses = [200, 201, 202];
      const receivedError = !!response.error;
      if (acceptableStatuses.indexOf(httpResponse.statusCode) === -1
          || receivedError) {
        if (response.error) {
          this.logger.error(`Server response: ${response.error}`,
                            `(status: ${httpResponse.statusCode})`);
          return {success: false};
        }

        throw new Error(
          "Received bad response from the server while requesting " +
          this.absoluteURL(addonUrl) +
          "\n\n" + "status: " + httpResponse.statusCode + "\n" +
          "response: " + formatResponse(response) + "\n" + "headers: " +
          JSON.stringify(httpResponse.headers || {}) + "\n");
      }

      return this.waitForSignedAddon(response.url);
    });
  }

  /**
   * Poll a status URL, waiting for the queued add-on to be signed.
   *
   * @param {String} URL to GET for add-on status.
   * @return {Promise}
   */
  waitForSignedAddon(statusUrl, opt) {
    var lastStatusResponse;

    opt = {
      clearTimeout: clearTimeout,
      setAbortTimeout: setTimeout,
      setStatusCheckTimeout: setTimeout,
      abortAfter: this.signedStatusCheckTimeout,
      ...opt,
    };

    return when.promise((resolve, reject) => {
      this._validateProgress.animate();
      var statusCheckTimeout;
      var nextStatusCheck;

      const checkSignedStatus = () => {
        return this.get({url: statusUrl}).then((result) => {
          var data = result[1];
          lastStatusResponse = data;

          // TODO: remove this when the API has been fully deployed with this
          // change: https://github.com/mozilla/olympia/pull/1041
          var apiReportsAutoSigning = typeof data.automated_signing !==
              "undefined";

          var canBeAutoSigned = data.automated_signing;
          var failedValidation = !data.valid;
          // The add-on passed validation and all files have been created.
          // There are many checks for this state because the data will be
          // updated incrementally by the API server.
          var signedAndReady = data.valid && data.active && data.reviewed &&
                               data.files && data.files.length > 0;
          // The add-on is valid but requires a manual review before it can
          // be signed.
          var requiresManualReview = data.valid && apiReportsAutoSigning &&
                                     !canBeAutoSigned;

          if (data.processed &&
                (failedValidation || signedAndReady || requiresManualReview)) {

            this._validateProgress.finish();
            opt.clearTimeout(statusCheckTimeout);
            this.logger.log("Validation results:", data.validation_url);

            if (requiresManualReview) {
              this.logger.log(
                "Your add-on has been submitted for review. It passed " +
                "validation but could not be automatically signed " +
                "because this is a listed add-on.");
              return resolve({success: false});
            } else if (signedAndReady) {
              // TODO: show some validation warnings if there are any.
              // We should show things like "missing update URL in install.rdf"
              return resolve(
                this.downloadSignedFiles(data.files)
                .then((result) => {
                  return {
                    id: data.guid,
                    ...result,
                  };
                }));
            } else {
              this.logger.log(
                "Your add-on failed validation and could not be signed");
              return resolve({success: false});
            }

          } else {
            // The add-on has not been fully processed yet.
            nextStatusCheck = opt.setStatusCheckTimeout(
                checkSignedStatus, this.signedStatusCheckInterval);
          }
        });
      };

      checkSignedStatus().catch(reject);

      statusCheckTimeout = opt.setAbortTimeout(() => {
        this._validateProgress.finish();
        opt.clearTimeout(nextStatusCheck);
        reject(new Error(
            "Validation took too long to complete; last status: " +
            formatResponse(lastStatusResponse || "[null]")));

      }, opt.abortAfter);

    });
  }

  /**
   * Download the signed files.
   *
   * @param {Array} Array of file objects returned from the API.
   *                Each object needs to have these parameters:
   *                  - `download_url` - the URL to the file
   * @return {Promise}
   */
  downloadSignedFiles(signedFiles,
                      {createWriteStream=defaultFs.createWriteStream,
                       request,
                       stdout=process.stdout} = {}) {
    if (!request) {
      request = this._request;
    }
    var allDownloads = [];
    var dataExpected = null;
    var dataReceived = 0;

    function showProgress() {
      var progress = "...";
      if (dataExpected !== null) {
        var amount = ((dataReceived / dataExpected) * 100).toFixed();
        // Pad the percentage amount so that the line length is consistent.
        // This should do something like '  0%', ' 25%', '100%'
        var padding = "";
        try {
          padding = Array(4 - amount.length).join(" ");
        } catch (e) {
          // Ignore Invalid array length and such.
        }
        progress = padding + amount + "% ";
      }
      stdout.write("\r" +
          "Downloading signed files: " + progress);
    }

    const download = (fileUrl) => {
      return when.promise((resolve, reject) => {
        // The API will give us a signed file named in a sane way.
        var fileName = path.join(this.downloadDir, getUrlBasename(fileUrl));
        var out = createWriteStream(fileName);

        request(
          this.configureRequest({
            method: "GET",
            url: fileUrl,
            followRedirect: true,
          }))
          .on("error", reject)
          .on("response", (response) => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
              throw new Error(
                `Got a ${response.statusCode} response ` +
                `when downloading ${fileUrl}`);
            }
            const contentLength = response.headers["content-length"];
            if (contentLength) {
              dataExpected += parseInt(contentLength);
            }
          })
          .on("data", function(chunk) {
            dataReceived += chunk.length;
            showProgress();
          })
          .pipe(out)
          .on("error", reject);

        out.on("finish", function() {
          stdout.write("\n");  // end the progress output
          resolve(fileName);
        });
      });
    };

    return when.promise((resolve, reject) => {
      var foundUnsignedFiles = false;
      signedFiles.forEach((file) => {
        if (file.signed) {
          allDownloads.push(download(file.download_url));
        } else {
          this.debug("This file was not signed:", file);
          foundUnsignedFiles = true;
        }
      });

      if (allDownloads.length) {
        if (foundUnsignedFiles) {
          this.logger.log(
            "Some files were not signed. Re-run with --verbose for details.");
        }
        showProgress();
        resolve(when.all(allDownloads));
      } else {
        reject(new Error(
          "The XPI was processed but no signed files were found. Check your " +
          "manifest and make sure it targets Firefox as an application."));
      }

    }).then((downloadedFiles) => {
      this.logger.log("Downloaded:");
      downloadedFiles.forEach((fileName) => {
        this.logger.log("    " + fileName.replace(process.cwd(), "."));
      });
      return {
        success: true,
        downloadedFiles: downloadedFiles,
      };
    });
  }

  /**
   * Make a GET request.
   *
   * @param {Object} conf, as accepted by the `request` module.
   * @param {Object} options, as accepted by `this.request()`.
   * @return {Promise}
   */
  get() {
    return this.request("get", ...arguments);
  }

  /**
   * Make a POST request.
   *
   * @param {Object} conf, as accepted by the `request` module.
   * @param {Object} options, as accepted by `this.request()`.
   * @return {Promise}
   */
  post() {
    return this.request("post", ...arguments);
  }

  /**
   * Make a PUT request.
   *
   * @param {Object} conf, as accepted by the `request` module.
   * @param {Object} options, as accepted by `this.request()`.
   * @return {Promise}
   */
  put() {
    return this.request("put", ...arguments);
  }

  /**
   * Make a PATCH request.
   *
   * @param {Object} conf, as accepted by the `request` module.
   * @param {Object} options, as accepted by `this.request()`.
   * @return {Promise}
   */
  patch() {
    return this.request("patch", ...arguments);
  }

  /**
   * Make a DELETE request.
   *
   * @param {Object} conf, as accepted by the `request` module.
   * @param {Object} options, as accepted by `this.request()`.
   * @return {Promise}
   */
  delete() {
    return this.request("delete", ...arguments);
  }

  /**
   * Returns a URL that is guaranteed to be absolute.
   *
   * @param {String} a relative or already absolute URL
   * @return {String} an absolute URL, prefixed by the API prefix if necessary.
   */
  absoluteURL(url) {
    if (!url.match(/^http/i)) {
      url = this.apiUrlPrefix + url;
    }
    return url;
  }

  /**
   * Configures a request with defaults such as authentication headers.
   *
   * @param {Object} requestConf as accepted by the `request` module.
   * @return {Object} new requestConf object suitable
   *                  for `request(conf)`, `request.get(conf)`, etc.
   */
  configureRequest(requestConf, {jwt=defaultJwt}={}) {
    requestConf = {...this.requestConfig, ...requestConf};
    if (!requestConf.url) {
      throw new Error("request URL was not specified");
    }
    requestConf.url = this.absoluteURL(requestConf.url);
    if (this.proxyServer) {
      requestConf.proxy = this.proxyServer;
    }

    var authToken = jwt.sign({iss: this.apiKey}, this.apiSecret, {
      algorithm: "HS256",
      expiresIn: this.apiJwtExpiresIn,
    });

    // Make sure the request won't time out before the JWT expires.
    // This may be useful for slow file uploads.
    requestConf.timeout = (this.apiJwtExpiresIn * 1000) + 500;

    requestConf.headers = {
      Authorization: "JWT " + authToken,
      Accept: "application/json",
      ...requestConf.headers,
    };

    return requestConf;
  }

  /**
   * Make any HTTP request to the addons.mozilla.org API.
   *
   * This includes the necessary authorization header.
   *
   * @param {String} method - HTTP method name.
   * @param {Object} requestConf as accepted by the `request` module.
   * @param {Object} options.
   *  - `throwOnBadResponse` - if true, an error will be thrown when not
   *                           response status is not 2xx
   *
   * The returned promise will be resolved with an array of arguments
   * that match the arguments sent to the callback as specified in the
   * `request` module.
   *
   * @return {Promise}
   */
  request(method, requestConf, {throwOnBadResponse=true} = {}) {
    method = method.toLowerCase();
    return when.promise((resolve) => {
      requestConf = this.configureRequest(requestConf);
      this.debug(`[API] ${method.toUpperCase()} request:\n`, requestConf);

      // Get the caller, like request.get(), request.put() ...
      var requestMethod = this._request[method].bind(this._request);
      // Wrap the request callback in a promise. Here is an example without
      // promises:
      //
      // request.put(requestConf, function(err, httpResponse, body) {
      //   // promise gets resolved here
      // })
      //
      resolve(nodefn.call(requestMethod, requestConf));

    }).then((responseResult) => {
      var httpResponse = responseResult[0];
      var body = responseResult[1];

      if (throwOnBadResponse) {
        if (httpResponse.statusCode > 299 || httpResponse.statusCode < 200) {
          throw new Error(
            "Received bad response from " +
            this.absoluteURL(requestConf.url) + "; " +
            "status: " + httpResponse.statusCode + "; " +
            "response: " + formatResponse(body));
        }
      }

      if (
        httpResponse.headers &&
          httpResponse.headers["content-type"] === "application/json" &&
          typeof body === "string"
      ) {
        try {
          body = JSON.parse(body);
        } catch (e) {
          this.logger.log("Failed to parse JSON response from server:", e);
        }
      }
      this.debug(`[API] ${method.toUpperCase()} response:\n`,
                 `Status: ${httpResponse.statusCode}\n`,
                 {headers: httpResponse.headers, response: body});

      return [httpResponse, body];
    });
  }

  /**
   * Output some debugging info if this instance is configured for it.
   */
  debug() {
    if (!this.debugLogging) {
      return;
    }

    function redact(obj) {
      if (typeof obj !== "object" || !obj) {
        return obj;
      }
      if (obj.headers) {
        ["Authorization", "cookie", "set-cookie"].forEach(function(hdr) {
          if (obj.headers[hdr]) {
            obj.headers[hdr] = "<REDACTED>";
          }
        });
      }
      Object.keys(obj).forEach(function(key) {
        obj[key] = redact(obj[key]);
      });
      return obj;
    }

    var args = Array.prototype.map.call(arguments, function(val) {
      if (typeof val === "object") {
        val = deepcopy(val);
        val = redact(val);
      }
      return val;
    });
    this.logger.log("[sign-addon]", ...args);
  }
}


/**
 * A pseudo progress indicator.
 *
 * This is just a silly shell animation that was meant to simulate how lots of
 * tests would be run on an add-on file. It sort of looks like a torrent file
 * randomly getting filled in.
 */
export class PseudoProgress {
  constructor({preamble="",
               setInterval=defaultSetInterval,
               clearInterval=defaultClearInterval,
               stdout=process.stdout} = {}) {

    this.bucket = [];
    this.interval = null;
    this.motionCounter = 1;

    this.preamble = preamble;
    this.preamble += " [";
    this.addendum = "]";
    this.setInterval = setInterval;
    this.clearInterval = clearInterval;
    this.stdout = stdout;

    var shellWidth = 80;
    if (this.stdout.isTTY) {
      shellWidth = this.stdout.columns;
    }

    this.emptyBucketPointers = [];
    var bucketSize = shellWidth - this.preamble.length - this.addendum.length;
    for (var i = 0; i < bucketSize; i++) {
      this.bucket.push(" ");
      this.emptyBucketPointers.push(i);
    }
  }

  animate(conf) {
    conf = {
      speed: 100,
      ...conf,
    };
    var bucketIsFull = false;
    this.interval = this.setInterval(() => {
      if (bucketIsFull) {
        this.moveBucket();
      } else {
        bucketIsFull = this.randomlyFillBucket();
      }
    }, conf.speed);
  }

  finish() {
    this.clearInterval(this.interval);
    this.fillBucket();
    // The bucket has already filled to the terminal width at this point
    // but for copy/paste purposes, add a new line:
    this.stdout.write("\n");
  }

  randomlyFillBucket() {
    // randomly fill a bucket (the width of the shell) with dots.
    var randomIndex = Math.floor(Math.random() *
                                 this.emptyBucketPointers.length);
    var pointer = this.emptyBucketPointers[randomIndex];
    this.bucket[pointer] = ".";

    this.showBucket();

    var isFull = true;
    var newPointers = [];
    this.emptyBucketPointers.forEach((pointer) => {
      if (this.bucket[pointer] === " ") {
        isFull = false;
        newPointers.push(pointer);
      }
    });
    this.emptyBucketPointers = newPointers;

    return isFull;
  }

  fillBucket() {
    // fill the whole bucket with dots to indicate completion.
    this.bucket = this.bucket.map(function() {
      return ".";
    });
    this.showBucket();
  }

  moveBucket() {
    // animate dots moving in a forward motion.
    for (var i = 0; i < this.bucket.length; i++) {
      this.bucket[i] = ((i - this.motionCounter) % 3) ? " " : ".";
    }
    this.showBucket();

    this.motionCounter ++;
  }

  showBucket() {
    this.stdout.write("\r" + this.preamble + this.bucket.join("") +
                      this.addendum);
  }
}

/**
 * Returns a nicely formatted HTTP response.
 *
 * This makes the response suitable for logging.
 * */
export function formatResponse(response, options) {
  options = {
    maxLength: 500,
    ...options,
  };
  var prettyResponse = response;
  if (typeof prettyResponse === "object") {
    try {
      prettyResponse = JSON.stringify(prettyResponse);
    } catch (e) {
      //
    }
  }
  if (typeof prettyResponse === "string") {
    if (prettyResponse.length > options.maxLength) {
      prettyResponse = prettyResponse.substring(0, options.maxLength) + "...";
    }
  }
  return prettyResponse.toString();
}

/**
 * Returns the basename of a URL, suitable for saving to disk.
 * */
export function getUrlBasename(absUrl) {
  var urlPath = path.basename(url.parse(absUrl).path);
  var parts = urlPath.split("?");
  return parts[0];
}
