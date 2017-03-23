var assert = require("assert"),
    path = require("path"),
    utils = require("./utils");

var StyleSheets;
var styleSheet;

var SS_TEXT = [
"main {",
"  font-family: Georgia, sans-serif;",
"  color: black;",
"}",
"",
"* {",
"  padding: 0;",
"  margin: 0;",
"}"
].join("\n");

before(function(done) {
  utils.loadTab('stylesheets.html', function(aTab) {
    StyleSheets = aTab.StyleSheets;
    StyleSheets.getStyleSheets(function(err, sheets) {
      assert.strictEqual(err, null);
      styleSheet = sheets[1];
      done();
    })
  });
});

// Stylesheets - getStyleSheets(), addStyleSheet()

describe('getStyleSheets()', function() {
  it('should list all the stylesheets', function(done) {
    StyleSheets.getStyleSheets(function(err, sheets) {
      assert.strictEqual(err, null);

      var hrefs = sheets.map(function(sheet) {
        assert.ok(sheet.update, "sheet has Stylesheet methods");
        return path.basename(sheet.href);
      });
      assert.deepEqual(hrefs, ["null", "stylesheet1.css"]);
      done();
    })
  })
})

describe('addStyleSheet()', function() {
  it('should add a new stylesheet', function(done) {
    var text = "div { font-weight: bold; }";

    StyleSheets.addStyleSheet(text, function(err, sheet) {
      assert.strictEqual(err, null);
      assert.ok(sheet.update, "sheet has Stylesheet methods");
      assert.equal(sheet.ruleCount, 1);
      done();
    })
  })
})

// StyleSheet - update(), toggleDisabled()

describe('StyleSheet', function() {
  it('should have the correct properties', function() {
    assert.equal(path.basename(styleSheet.href), "stylesheet1.css");
    assert.strictEqual(styleSheet.disabled, false);
    assert.equal(styleSheet.ruleCount, 2);
  })
})

describe('StyleSheet.getText()', function() {
  it('should get the text of the style sheet', function(done) {
    styleSheet.getText(function(err, resp) {
      assert.strictEqual(err, null);
      assert.equal(resp, SS_TEXT);
      done();
    })
  })
});

describe('StyleSheet.update()', function() {
  it('should update stylesheet', function(done) {
    var text = "main { color: red; }";

    styleSheet.update(text, function(err, resp) {
      assert.strictEqual(err, null);
      // TODO: assert.equal(styleSheet.ruleCount, 1);
      done();
    })
  })
})

describe('StyleSheet.toggleDisabled()', function() {
  it('should toggle disabled attribute', function(done) {
    assert.deepEqual(styleSheet.disabled, false);

    styleSheet.toggleDisabled(function(err, resp) {
      assert.strictEqual(err, null);
      assert.deepEqual(styleSheet.disabled, true);
      done();
    })
  })

  it('should fire disabled-changed event', function(done) {
    styleSheet.toggleDisabled(function(err, resp) {
      assert.strictEqual(err, null);
      assert.deepEqual(styleSheet.disabled, false);
    })
    styleSheet.on("disabled-changed", function(disabled) {
      assert.strictEqual(disabled, false);
      done();
    })
  })
})

describe('StyleSheet.getOriginalSources()', function() {
  it('should get no original sources', function(done) {
    styleSheet.getOriginalSources(function(err, resp) {
      assert.strictEqual(err, null);
      assert.deepEqual(resp, []);
      done();
    })
  })
})
