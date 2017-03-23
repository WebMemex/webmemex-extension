'use strict';

var connect = require('../');

// Connect to a runtime listening to port 8000
connect(8000).then(function(client) {

  // Let's show for example all the running apps
  client.getWebapps(function(err, webapps) {
    webapps.listRunningApps(function(err, apps) {
      console.log('Running apps:', apps);
    });
  });
  
});
