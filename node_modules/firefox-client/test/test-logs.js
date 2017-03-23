var assert = require("assert"),
    utils = require("./utils");

var tab;
var Console;

before(function(done) {
  utils.loadTab('logs.html', function(aTab) {
    tab = aTab;
    Console = aTab.Console;

    Console.startListening(function() {
      done();
    })
  });
});

// Console - startLogging(), stopLogging(), getCachedMessages(),
// clearCachedMessages(), event:page-error, event:console-api-call

describe('getCachedMessages()', function() {
  it('should get messages from before listening', function(done) {
    Console.getCachedLogs(function(err, messages) {
      assert.strictEqual(err, null);

      var hasLog = messages.some(function(message) {
        return message.level == "log";
      })
      assert.ok(hasLog);

      var hasDir = messages.some(function(message) {
        return message.level == "dir";
      })
      assert.ok(hasDir);

      var hasError = messages.some(function(message) {
        return message.errorMessage == "ReferenceError: foo is not defined";
      })
      assert.ok(hasError);
      done();
    });
  })
})

describe('clearCachedMessages()', function() {
  it('should clear cached messages', function(done) {
    Console.clearCachedLogs(function() {
      Console.getCachedLogs(function(err, messages) {
        assert.strictEqual(err, null);
        // The error message should be left
        assert.equal(messages.length, 1);
        assert.equal(messages[0].errorMessage, "ReferenceError: foo is not defined")
        done();
      })
    });
  })
})

describe('"page-error" event', function() {
  it('should receive "page-error" event with message', function(done) {
    Console.once('page-error', function(event) {
      assert.equal(event.errorMessage, "ReferenceError: foo is not defined");
      assert.ok(event.sourceName.indexOf("logs.html") > 0);
      assert.equal(event.lineNumber, 10);
      assert.equal(event.columnNumber, 0);
      assert.ok(event.exception);

      done();
    });

    tab.reload();
  })
})

describe('"console-api-call" event', function() {
  it('should receive "console-api-call" for console.log', function(done) {
    Console.on('console-api-call', function(event) {
      if (event.level == "log") {
        assert.deepEqual(event.arguments, ["hi"]);

        Console.removeAllListeners('console-api-call');
        done();
      }
    });

    tab.reload();
  })

  it('should receive "console-api-call" for console.dir', function(done) {
    Console.on('console-api-call', function(event) {
      if (event.level == "dir") {
        var obj = event.arguments[0];
        assert.ok(obj.ownPropertyNames, "dir argument has JSObject methods");

        Console.removeAllListeners('console-api-call');
        done();
      }
    });

    tab.reload();
  })
})

after(function() {
  Console.stopListening();
})
