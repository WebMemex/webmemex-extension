var extend = require("./extend"),
    ClientMethods = require("./client-methods"),
    Client = require("./client"),
    Tab = require("./tab"),
    Webapps = require("./webapps"),
    Device = require("./device"),
    SimulatorApps = require("./simulator");

const DEFAULT_PORT = 6000;
const DEFAULT_HOST = "localhost";

module.exports = FirefoxClient;

function FirefoxClient(options) {
  var client = new Client(options);
  var actor = 'root';

  client.on("error", this.onError.bind(this));
  client.on("end", this.onEnd.bind(this));
  client.on("timeout", this.onTimeout.bind(this));

  this.initialize(client, actor);
}

FirefoxClient.prototype = extend(ClientMethods, {
  connect: function(port, host, cb) {
    if (typeof port == "function") {
      // (cb)
      cb = port;
      port = DEFAULT_PORT;
      host = DEFAULT_HOST;

    }
    if (typeof host == "function") {
      // (port, cb)
      cb = host;
      host = DEFAULT_HOST;
    }
    // (port, host, cb)

    this.client.connect(port, host, cb);

    this.client.expectReply(this.actor, function(packet) {
      // root message
    });
  },

  disconnect: function() {
    this.client.disconnect();
  },

  onError: function(error) {
    this.emit("error", error);
  },

  onEnd: function() {
    this.emit("end");
  },

  onTimeout: function() {
    this.emit("timeout");
  },

  selectedTab: function(cb) {
    this.request("listTabs", function(resp) {
      var tab = resp.tabs[resp.selected];
      return new Tab(this.client, tab);
    }.bind(this), cb);
  },

  listTabs: function(cb) {
    this.request("listTabs", function(err, resp) {
      if (err) {
        return cb(err);
      }

      if (resp.simulatorWebappsActor) {
        // the server is the Firefox OS Simulator, return apps as "tabs"
        var apps = new SimulatorApps(this.client, resp.simulatorWebappsActor);
        apps.listApps(cb);
      }
      else {
        var tabs = resp.tabs.map(function(tab) {
          return new Tab(this.client, tab);
        }.bind(this));
        cb(null, tabs);
      }
    }.bind(this));
  },

  getWebapps: function(cb) {
    this.request("listTabs", (function(err, resp) {
      if (err) {
        return cb(err);
      }
      var webapps = new Webapps(this.client, resp);
      cb(null, webapps);
    }).bind(this));
  },

  getDevice: function(cb) {
    this.request("listTabs", (function(err, resp) {
      if (err) {
        return cb(err);
      }
      var device = new Device(this.client, resp);
      cb(null, device);
    }).bind(this));
  },

  getRoot: function(cb) {
    this.request("listTabs", (function(err, resp) {
      if (err) {
        return cb(err);
      }
      if (!resp.consoleActor) {
        return cb("No root actor being available.");
      }
      var root = new Tab(this.client, resp);
      cb(null, root);
    }).bind(this));
  }
})
