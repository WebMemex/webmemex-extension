'use strict';

// See https://github.com/jshint/jshint/issues/1747 for context
/* global -Promise */
var Promise = require('es6-promise').Promise;
var FirefoxClient = require('firefox-client');

module.exports = connect;

function connect(port) {
  return new Promise(function(resolve, reject) {

    var client = new FirefoxClient();
    client.connect(port, function(err) {
      if (err) {
        reject(err);
      }
      resolve(client);
    });

    client.on('error', reject);
    client.on('timeout', reject);
  });
}
