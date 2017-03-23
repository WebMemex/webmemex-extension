var assert = require('assert'),
    FirefoxClient = require("./index");


var url = "file:///Users/harth/repos/sass-wwcode/index.html";

loadUrl(url, function(tab) {
  tab.StyleSheets.getStyleSheets(function(err, sheets) {
    var sheet = sheets[1];
    sheet.getOriginalSources(function(err, sources) {
      console.log(err);
      console.log(sources[0].url);
      sources[0].getText(function(err, resp) {
        console.log(err);
        console.log(resp);
      })
    });
    console.log(sheet.href);
  });
})


/**
 * Helper functions
 */
function loadUrl(url, callback) {
  getFirstTab(function(tab) {
    console.log("GOT TAB");
    tab.navigateTo(url);

    tab.once("navigate", function() {
      console.log("NAVIGATED");
      callback(tab);
    });
  });
}

function getFirstTab(callback) {
  var client = new FirefoxClient({log: true});

  client.connect(function() {
    client.listTabs(function(err, tabs) {
      if (err) throw err;

      var tab = tabs[0];

      // attach so we can receive load events
      tab.attach(function(err) {
        if (err) throw err;
        callback(tab);
      })
    });
  });
}