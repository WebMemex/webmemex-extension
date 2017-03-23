var extend = require("./extend"),
    ClientMethods = require("./client-methods");

module.exports = Memory;

function Memory(client, actor) {
  this.initialize(client, actor);
}

Memory.prototype = extend(ClientMethods, {
  measure: function(cb) {
    this.request('measure', function (err, resp) {
      cb(err, resp);
    });
  }
})
