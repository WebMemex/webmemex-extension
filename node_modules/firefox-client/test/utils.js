var assert = require('assert'),
    FirefoxClient = require("../index");

var tab;

exports.loadTab = function(url, callback) {
  getFirstTab(function(tab) {
    tab.navigateTo(url);

    tab.once("navigate", function() {
      callback(tab);
    });
  })
};


function getFirstTab(callback) {
  if (tab) {
    return callback(tab);
  }
  var client = new FirefoxClient({log: true});

  client.connect(function() {
    client.listTabs(function(err, tabs) {
      if (err) throw err;

      tab = tabs[0];

      tab.attach(function(err) {
        if (err) throw err;
        callback(tab);
      })
    });
  });
}