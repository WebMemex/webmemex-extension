var extend = require("./extend"),
    ClientMethods = require("./client-methods"),
    Tab = require("./tab");

module.exports = SimulatorApps;

function SimulatorApps(client, actor) {
  this.initialize(client, actor);
}

SimulatorApps.prototype = extend(ClientMethods, {
  listApps: function(cb) {
    this.request('listApps', function(resp) {
      var apps = [];
      for (var url in resp.apps) {
        var app = resp.apps[url];
        apps.push(new Tab(this.client, app));
      }
      return apps;
    }.bind(this), cb);
  }
})
