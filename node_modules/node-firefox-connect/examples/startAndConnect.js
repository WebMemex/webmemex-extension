'use strict';

var connect = require('../');
var startSimulator = require('node-firefox-start-simulator');

startSimulator({}).then(function(simulator) {

  // Connect to the simulator we just launched
  connect(simulator.port).then(function(client) {

    // Let's show for example all the running apps
    client.getWebapps(function(err, webapps) {
      webapps.listRunningApps(function(err, apps) {
        console.log('Running apps:', apps);
      });
    });
    
  });
  
});

