var extend = require("./extend"),
    ClientMethods = require("./client-methods"),
    Tab = require("./tab"),
    fs = require("fs"),
    spawn = require("child_process").spawn;

module.exports = Webapps;

var CHUNK_SIZE = 20480;

// Also dispatch appOpen/appClose, appInstall/appUninstall events
function Webapps(client, tab) {
  this.initialize(client, tab.webappsActor);
}

Webapps.prototype = extend(ClientMethods, {
  watchApps: function(cb) {
    this.request("watchApps", cb);
  },
  unwatchApps: function(cb) {
    this.request("unwatchApps", cb);
  },
  launch: function(manifestURL, cb) {
    this.request("launch", {manifestURL: manifestURL}, cb);
  },
  close: function(manifestURL, cb) {
    this.request("close", {manifestURL: manifestURL}, cb);
  },
  getInstalledApps: function(cb) {
    this.request("getAll", function (err, resp) {
      if (err) {
        cb(err);
        return;
      }
      cb(null, resp.apps);
    });
  },
  listRunningApps: function(cb) {
    this.request("listRunningApps", function (err, resp) {
      if (err) {
        cb(err);
        return;
      }
      cb(null, resp.apps);
    });
  },
  getApp: function(manifestURL, cb) {
    this.request("getAppActor", {manifestURL: manifestURL}, (function (err, resp) {
      if (err) {
        cb(err);
        return;
      }
      var actor = new Tab(this.client, resp.actor);
      cb(null, actor);
    }).bind(this));
  },
  installHosted: function(options, cb) {
    this.request(
      "install",
      { appId: options.appId,
        metadata: options.metadata,
        manifest: options.manifest },
      function (err, resp) {
        if (err || resp.error) {
          cb(err || resp.error);
          return;
        }
        cb(null, resp.appId);
      });
  },
  _upload: function (path, cb) {
    // First create an upload actor
    this.request("uploadPackage", function (err, resp) {
      var actor = resp.actor;
      fs.readFile(path, function(err, data) {
        chunk(actor, data);
      });
    });
    // Send push the file chunk by chunk
    var self = this;
    var step = 0;
    function chunk(actor, data) {
      var i = step++ * CHUNK_SIZE;
      var m = Math.min(i + CHUNK_SIZE, data.length);
      var c = "";
      for(; i < m; i++)
        c += String.fromCharCode(data[i]);
      var message = {
        to: actor,
        type: "chunk",
        chunk: c
      };
      self.client.makeRequest(message, function(resp) {
        if (resp.error) {
          cb(resp);
          return;
        }
        if (i < data.length) {
          setTimeout(chunk, 0, actor, data);
        } else {
          done(actor);
        }
      });
    }
    // Finally close the upload
    function done(actor) {
      var message = {
        to: actor,
        type: "done"
      };
      self.client.makeRequest(message, function(resp) {
        if (resp.error) {
          cb(resp);
        } else {
          cb(null, actor, cleanup.bind(null, actor));
        }
      });
    }

    // Remove the temporary uploaded file from the server:
    function cleanup(actor) {
      var message = {
        to: actor,
        type: "remove"
      };
      self.client.makeRequest(message, function () {});
    }
  },
  installPackaged: function(path, appId, cb) {
    this._upload(path, (function (err, actor, cleanup) {
      this.request("install", {appId: appId, upload: actor},
        function (err, resp) {
          if (err) {
            cb(err);
            return;
          }
          cb(null, resp.appId);
          cleanup();
        });
    }).bind(this));
  },
  installPackagedWithADB: function(path, appId, cb) {
    var self = this;
    // First ensure the temporary folder exists
    function createTemporaryFolder() {
      var c = spawn("adb", ["shell", "mkdir -p /data/local/tmp/b2g/" + appId], {stdio:"inherit"});
      c.on("close", uploadPackage);
    }
    // then upload the package to the temporary directory
    function uploadPackage() {
      var child = spawn("adb", ["push", path, "/data/local/tmp/b2g/" + appId + "/application.zip"], {stdio:"inherit"});
      child.on("close", installApp);
    }
    // finally order the webapps actor to install the app
    function installApp() {
      self.request("install", {appId: appId},
        function (err, resp) {
          if (err) {
            cb(err);
            return;
          }
          cb(null, resp.appId);
        });
    }
    createTemporaryFolder();
  },
  uninstall: function(manifestURL, cb) {
    this.request("uninstall", {manifestURL: manifestURL}, cb);
  }
})
