'use strict';

var mockery = require('mockery');
mockery.registerMock('firefox-client', MockFirefoxClient);
mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
});

var connect = require('../../index');

module.exports = {

  'connect() creates a FirefoxClient and resolves promise after connect': function(test) {

    var PORT = 2112;

    connect(PORT).then(function(client) {
      test.equal(PORT, client.port);
      test.done();
    }).catch(function(err) {
      test.ifError(err);
      test.done();
    });

  }


};

// Below is just enough stolen from firefox-client to present the same
// interface to node-firefox-connect

var DEFAULT_PORT = 6000;
var DEFAULT_HOST = 'localhost';

function MockFirefoxClient(options) {
  this.port = null;
  this.host = null;
}

MockFirefoxClient.prototype = {
  connect: function(port, host, cb) {

    if (typeof port === 'function') {
      // (cb)
      cb = port;
      port = DEFAULT_PORT;
      host = DEFAULT_HOST;
    }

    if (typeof host === 'function') {
      // (port, cb)
      cb = host;
      host = DEFAULT_HOST;
    }

    this.port = port;
    this.host = host;

    return cb();
  }
};
