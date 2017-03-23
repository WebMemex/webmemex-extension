/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

var os = require("os");
var fs = require("fs");
var path = require("path");
var chai = require("chai");
var expect = chai.expect;
var utils = require("../../lib/utils");
var all = require("when").all;
var sandbox = require('sandboxed-module');
var binary = utils.normalizeBinary;
var which = require("which");

var prevDir, prevBinary;

describe("lib/utils", function () {
  it("normalizeBinary() finds binary by accessing the registry on Windows", function(done) {
    // Skip this test for now, to get Travis running.
    if (!/win/i.test(os.platform)) {
      done();
      return;
    }

    // see ./mock-winreg.js
    var expected = "fake\\binary\\path";
    var binary = sandbox.require("../../lib/utils", {
      requires: {"winreg": function() {
        this.get = function(_, fn) {
          fn(null, {value: expected});
        };
      }}
    }).normalizeBinary;

    var promises = [
      [null, "windows", "x86"],
      [null, "windows", "x86_64"]
    ].map(function(args) {
      var promise = binary.apply(binary, args);
      return promise.then(function(actual) {
        expect(actual).to.be.equal(expected);
      });
    });
    all(promises).then(done.bind(null, null), done);
  });

  it("normalizeBinary() uses env var when registry access fails on Windows", function(done) {
    var args = 0;
    var expected = 1;

    var envPath64 = "path\\from\\env\\var\\64";
    var envPath32 = "path\\from\\env\\var\\32";

    var binary = sandbox.require("../../lib/utils", {
      requires: {"winreg": function() {
        this.get = function(_, fn) {
          fn("Failed", null);
        };
      }},
      locals: {process: {env: {"ProgramFiles": envPath32, "ProgramFiles(x86)": envPath64}}}
    }).normalizeBinary;

    var promises = [
      [[null, "windows", "x86"], path.join(envPath32, "Mozilla Firefox", "firefox.exe")],
      [[null, "windows", "x86_64"], path.join(envPath64, "Mozilla Firefox", "firefox.exe")]
    ].map(function(fixture) {
      var promise = binary.apply(binary, fixture[args]);
      return promise.then(function(actual) {
        expect(actual).to.be.equal(fixture[expected]);
      });
    });
    all(promises).then(done.bind(null, null), done);
  });

  it("normalizeBinary() default sets (OS X)", function (done) {
    delete process.env.JPM_FIREFOX_BINARY;
    var args = 0;
    var expected = 1;

    var promises = [
      [[null, "darwin", "x86"], "/Applications/Firefox.app/Contents/MacOS/firefox-bin"],
      [[null, "darwin", "x86_64"], "/Applications/Firefox.app/Contents/MacOS/firefox-bin"]
    ].map(function(fixture) {
      var promise = binary.apply(binary, fixture[args]);
      return promise.then(function(actual) {
        expect(actual).to.be.equal(fixture[expected]);
      });
    });
    all(promises).then(done.bind(null, null), done);
  });

  it("normalizeBinary() default sets (linux)", function (done) {
    delete process.env.JPM_FIREFOX_BINARY;
    var args = 0;
    var expected = 1;

    var binary = sandbox.require("../../lib/utils", {
      requires: {
        which: function(bin, callback) {
          callback(null, "/usr/bin/" + bin);
        }
      }
    }).normalizeBinary;

    var promises = [
      [[null, "linux", "x86"], "/usr/bin/firefox"],
      [[null, "linux", "x86_64"], "/usr/bin/firefox"]
    ].map(function(fixture) {
      var promise = binary.apply(binary, fixture[args]);
      return promise.then(function(actual) {
        expect(actual).to.be.equal(fixture[expected]);
      });
    });
    all(promises).then(done.bind(null, null), done);
  });

  it("normalizeBinary() returns binary path if passed", function (done) {
    var bPath = "/path/to/binary";
    binary(bPath).then(function(actual) {
      expect(actual).to.be.equal(bPath);
    }).then(done.bind(null, null), done);
  });

  it("normalizeBinary() finds OSX's full path when given .app", function (done) {
    process.env.JPM_FIREFOX_BINARY = undefined;
    binary("/Application/FirefoxNightly.app", "darwin").then(function(actual) {
      expect(actual).to.be.equal(
        path.join("/Application/FirefoxNightly.app/Contents/MacOS/firefox-bin"));
    }).then(done.bind(null, null), done);
  });

  it("normalizeBinary() uses JPM_FIREFOX_BINARY if no path specified", function (done) {
    process.env.JPM_FIREFOX_BINARY = "/my/custom/path";
    binary().then(function(actual) {
      expect(actual).to.be.equal("/my/custom/path");
    }).then(done.bind(null, null), done);
  });

  it("normalizeBinary() uses path over JPM_FIREFOX_BINARY if specified", function (done) {
    process.env.JPM_FIREFOX_BINARY = "/my/custom/path";
    binary("/specific/path").then(function(actual) {
      expect(actual).to.be.equal("/specific/path");
    }).then(done.bind(null, null), done);
  });

  it("normalizeBinary() normalizes special names like: nightly, beta, etc... on Windows", function(done) {
    var args = 0;
    var expected = 1;

    var binary = sandbox.require("../../lib/utils", {
      requires: {"winreg": function(options) {
        var value = "Normal or beta";
        if (options.key.toLowerCase().indexOf("nightly") != -1) {
          value = "nightly";
        }
        if (options.key.toLowerCase().indexOf("aurora") != -1) {
          value = "aurora";
        }
        this.get = function(_, fn) {
          fn(null, {value: value});
        };
      }},
      locals: {process: {env: {"ProgramFiles": "envPath32", "ProgramFiles(x86)": "envPath64"}}}
    }).normalizeBinary;

    var promises = [
      [["nightly", "windows", "x86"], "nightly"],
      [["nightly", "windows", "x86_64"], "nightly"],
      [["aurora", "windows", "x86"], "aurora"],
      [["aurora", "windows", "x86_64"], "aurora"]
    ].map(function(fixture) {
      var promise = binary.apply(binary, fixture[args]);
      return promise.then(function(actual) {
        expect(actual).to.be.equal(fixture[expected]);
      });
    });
    all(promises).then(done.bind(null, null), done);
  });

  it("normalizeBinary() normalizes special names like: firefox, nightly, etc... on Linux", function(done) {
    var args = 0;
    var expected = 1;

    var binary = sandbox.require("../../lib/utils", {
      requires: {
        which: function(bin, callback) {
          callback(null, "/usr/bin/" + bin);
        }
      }
    }).normalizeBinary;

    var promises = [
      [["firefox", "linux", "x86"], "/usr/bin/firefox"],
      [["firefox", "linux", "x86_64"], "/usr/bin/firefox"],

      [["beta", "linux", "x86"], "/usr/bin/firefox-beta"],
      [["beta", "linux", "x86_64"], "/usr/bin/firefox-beta"],

      [["aurora", "linux", "x86"], "/usr/bin/firefox-aurora"],
      [["aurora", "linux", "x86_64"], "/usr/bin/firefox-aurora"],

      [["nightly", "linux", "x86_64"], "/usr/bin/firefox-nightly"],
      [["nightly", "linux", "x86_64"], "/usr/bin/firefox-nightly"],
    ].map(function(fixture) {
      var promise = binary.apply(binary, fixture[args]);
      return promise.then(function(actual) {
        expect(actual).to.be.equal(fixture[expected]);
      });
    });
    all(promises).then(done.bind(null, null), done);
  });

  it("normalizeBinary() normalizes special names like: firefox, nightly, etc... on OS X", function(done) {
    var args = 0;
    var expected = 1;

    var promises = [
      [["firefox", "darwin", "x86"], "/Applications/Firefox.app/Contents/MacOS/firefox-bin"],
      [["firefox", "darwin", "x86_64"], "/Applications/Firefox.app/Contents/MacOS/firefox-bin"],

      [["beta", "darwin", "x86"], "/Applications/FirefoxBeta.app/Contents/MacOS/firefox-bin"],
      [["beta", "darwin", "x86_64"], "/Applications/FirefoxBeta.app/Contents/MacOS/firefox-bin"],

      [["firefoxdeveloperedition", "darwin", "x86"], "/Applications/FirefoxDeveloperEdition.app/Contents/MacOS/firefox-bin"],
      [["firefoxdeveloperedition", "darwin", "x86_64"], "/Applications/FirefoxDeveloperEdition.app/Contents/MacOS/firefox-bin"],

      [["aurora", "darwin", "x86"], "/Applications/FirefoxAurora.app/Contents/MacOS/firefox-bin"],
      [["aurora", "darwin", "x86_64"], "/Applications/FirefoxAurora.app/Contents/MacOS/firefox-bin"],

      [["nightly", "darwin", "x86"], "/Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin"],
      [["nightly", "darwin", "x86_64"], "/Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin"]
    ].map(function(fixture) {
      var promise = binary.apply(binary, fixture[args]);
      return promise.then(function(actual) {
        expect(actual).to.be.equal(fixture[expected]);
      });
    });
    all(promises).then(done.bind(null, null), done);
  });

  describe("findMacAppByChannel", function() {

    var defaultNightly = "/Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin";

    function spawnSyncStub(stdout) {
      return function() {
        return {stdout: stdout};
      }
    }

    it("returns false when no app is found", function() {
      var result = utils.findMacAppByChannel("nightly", {spawnSync: spawnSyncStub("")});
      expect(result).to.be.equal(null);
    });

    it("returns sole app result", function() {
      var result = utils.findMacAppByChannel("nightly", {
        spawnSync: spawnSyncStub(defaultNightly + "\n"),
      });
      expect(result).to.be.equal(defaultNightly);
    });

    it("prefers to find the default app", function() {
      var result = utils.findMacAppByChannel("nightly", {
        spawnSync: spawnSyncStub([
          "/src/mozilla-central/Nightly.app/Contents/MacOS/firefox-bin",
          defaultNightly,
        ].join("\n")),
      });
      expect(result).to.be.equal(defaultNightly);
    });

    it("falls back to the first app result", function() {
      var randomApp = "/src/mozilla-central/Nightly.app/Contents/MacOS/firefox-bin";
      var result = utils.findMacAppByChannel("nightly", {
        spawnSync: spawnSyncStub(randomApp + "\n"),
      });
      expect(result).to.be.equal(randomApp);
    });

  });
});
