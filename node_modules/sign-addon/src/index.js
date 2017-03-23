// Importing this like `import fs from "mz/fs"` was causing usage on
// npm 2.x to throw missing dependency errors. *shrug*
import {fs} from "mz";
import when from "when";

import {Client as DefaultAMOClient} from "./amo-client";


export default function signAddon(
  {
    // Absolute path to add-on XPI file.
    xpiPath,
    // The add-on ID as recognized by AMO. Example: my-addon@jetpack
    id,
    // The add-on version number for AMO.
    version,
    // Your API key (JWT issuer) from AMO Devhub.
    apiKey,
    // Your API secret (JWT secret) from AMO Devhub.
    apiSecret,
    // Optional arguments:
    apiUrlPrefix="https://addons.mozilla.org/api/v3",
    // Number of seconds until the JWT token for the API request expires.
    // This must match the expiration time that the API server accepts.
    apiJwtExpiresIn,
    verbose=false,
    // Number of milleseconds to wait before giving up on a
    // response from Mozilla's web service.
    timeout,
    // Absolute directory to save downloaded files in.
    downloadDir,
    // Optional proxy to use for all API requests,
    // such as "http://yourproxy:6000"
    apiProxy,
    // Optional object to pass into request() for additional configuration.
    // Not all properties are guaranteed to be applied.
    apiRequestConfig,
    AMOClient=DefaultAMOClient,
  }) {

  return when.promise(
    (resolve) => {

      function reportEmpty(name) {
        throw new Error(`required argument was empty: ${name}`);
      }

      if (!xpiPath) {
        reportEmpty("xpiPath");
      }
      if (!version) {
        reportEmpty("version");
      }
      if (!apiSecret) {
        reportEmpty("apiSecret");
      }
      if (!apiKey) {
        reportEmpty("apiKey");
      }

      resolve();
    })
    .then(() => fs.stat(xpiPath))
    .catch((statError) => {
      throw new Error(`error with ${xpiPath}: ${statError}`);
    })
    .then((stats) => {
      if (!stats.isFile) {
        throw new Error(`not a file: ${xpiPath}`);
      }
    })
    .then(() => {

      let client = new AMOClient({
        apiKey,
        apiSecret,
        apiUrlPrefix,
        apiJwtExpiresIn,
        downloadDir,
        debugLogging: verbose,
        signedStatusCheckTimeout: timeout,
        proxyServer: apiProxy,
        requestConfig: apiRequestConfig,
      });

      return client.sign({
        xpiPath: xpiPath,
        guid: id,
        version: version,
      });

    });
}


export function signAddonAndExit(
    options, {systemProcess=process, throwError=false, logger=console}) {
  return signAddon(options)
    .then((result) => {
      logger.log(result.success ? "SUCCESS" : "FAIL");
      systemProcess.exit(result.success ? 0 : 1);
    })
    .catch((err) => {
      logger.error("FAIL");
      if (throwError) {
        throw err;
      }
      logger.error(err.stack);
      systemProcess.exit(1);
    });
}
