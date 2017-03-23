var extend = require("./extend"),
    ClientMethods = require("./client-methods");

module.exports = Device;

function Device(client, tab) {
  this.initialize(client, tab.deviceActor);
}

Device.prototype = extend(ClientMethods, {
  getDescription: function(cb) {
    this.request("getDescription", function(err, resp) {
      if (err) {
        return cb(err);
      }

      cb(null, resp.value);
    });
  },
  getRawPermissionsTable: function(cb) {
    this.request("getRawPermissionsTable", function(err, resp) {
      if (err) {
        return cb(err);
      }

      cb(null, resp.value.rawPermissionsTable);
    });
  }
})
