var assert = require("assert"),
    FirefoxClient = require("../index");

var client = new FirefoxClient();

before(function(done) {
  client.connect(function() {
    done();
  })
});

describe('makeRequest()', function() {
  it('should do listTabs request', function(done) {
    var message = {
      to: 'root',
      type: 'listTabs'
    };

    client.client.makeRequest(message, function(resp) {
      assert.equal(resp.from, "root");
      assert.ok(resp.tabs);
      assert.ok(resp.profilerActor)
      done();
    })
  })
})