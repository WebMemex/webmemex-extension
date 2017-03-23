var assert = require("assert"),
    path = require("path"),
    utils = require("./utils");

var tab;
var Network;
var Console;

before(function(done) {
  utils.loadTab('network.html', function(aTab) {
    tab = aTab;
    Network = aTab.Network;
    Console = aTab.Console;

    Network.startLogging(function(err) {
      assert.strictEqual(err, null);
      done();
    })
  });
});

// Network - startLogging(), stopLogging(), sendHTTPRequest(), event:network-event

describe('"network-event" event', function() {
  it('should receive "network-event" event with message', function(done) {
    Network.once('network-event', function(event) {
      assert.equal(event.method, "GET");
      assert.equal(path.basename(event.url), "test-network.json");
      assert.ok(event.isXHR);
      assert.ok(event.getResponseHeaders, "event has NetworkEvent methods")
      done();
    });

    Console.evaluateJS("sendRequest()")
  })
})

describe('sendHTTPRequest()', function() {
  it('should send a new XHR request from page', function(done) {
    var request = {
      url: "test-network.json",
      method: "GET",
      headers: [{name: "test-header", value: "test-value"}]
    };

    Network.sendHTTPRequest(request, function(err, netEvent) {
      assert.strictEqual(err, null);
      assert.ok(netEvent.getResponseHeaders, "event has NetworkEvent methods");
      done();
    });
  })
})

// NetworkEvent - getRequestHeaders(), getRequestCookies(), getRequestPostData(),
// getResponseHeaders(), getResponseCookies(), getResponseContent(), getEventTimings()
// event:update


describe('getRequestHeaders(', function() {
  it('should get request headers', function(done) {
    Network.on('network-event', function(netEvent) {
      netEvent.on("request-headers", function(event) {
        assert.ok(event.headers);
        assert.ok(event.headersSize);

        netEvent.getRequestHeaders(function(err, resp) {
          assert.strictEqual(err, null);

          var found = resp.headers.some(function(header) {
            return header.name == "test-header" &&
                   header.value == "test-value";
          });
          assert.ok(found, "contains that header we sent");
          done();
        })
      })
    });
    Console.evaluateJS("sendRequest()");
  })
})

// TODO: NetworkEvent tests

after(function() {
  Network.stopLogging(function(err) {
    assert.strictEqual(err, null);
  });
})
