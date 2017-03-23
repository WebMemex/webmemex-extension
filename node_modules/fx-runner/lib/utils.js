/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

var defaultSpawnSync = require("spawn-sync");
var path = require("path");
var os = require("os");
var Winreg = require("winreg");
var when = require("when");
var which = require("when/node").lift(require("which"));

/**
 * Takes a path to a binary file (like `/Applications/FirefoxNightly.app`)
 * and based on OS, resolves to the actual binary file. Accepts an optional
 * `platform` and `arch` parameter for testing.
 *
 * @param {string} binaryPath
 * @param {string} [platform]
 * @param {string} [arch]
 * @return {Promise}
 */
function normalizeBinary (binaryPath, platform, arch) {
  return when.promise(function(resolve, reject) {
    platform = platform || os.platform();
    arch = arch || os.arch();
    binaryPath = binaryPath || process.env.JPM_FIREFOX_BINARY || "firefox";

    arch = /64/.test(arch) ? "(64)" : "";
    platform = /darwin/i.test(platform) ? "osx" :
               /win/i.test(platform) ? "windows" + arch :
               /linux/i.test(platform) ? "linux" + arch :
               platform;

    var app = binaryPath.toLowerCase();

    if (platform === "osx") {
      var result = null;
      var channelNames = [
        "firefox", "firefoxdeveloperedition", "beta", "nightly", "aurora"
      ];

      if (channelNames.indexOf(binaryPath) !== -1) {
        result = findMacAppByChannel(binaryPath);
      }
      binaryPath = result ||
                   normalizeBinary.paths[app + " on " + platform] ||
                   binaryPath;
      var isAppPath = path.extname(binaryPath) === ".app";

      // On OSX, if given the app path, resolve to the actual binary
      binaryPath = isAppPath ? path.join(binaryPath, "Contents/MacOS/firefox-bin") :
                   binaryPath;

      return resolve(binaryPath);
    }
    // Return the path if it contains at least two segments
    else if (binaryPath.indexOf(path.sep) !== -1) {
      return resolve(binaryPath);
    }
    // On linux but no path yet, use which to try and find the binary
    else if (platform.indexOf("linux") !== -1) {
        binaryPath = normalizeBinary.appNames[binaryPath + " on linux"] || binaryPath;
        return resolve(which(binaryPath));
    }
    // No action needed on windows if it's an executable already
    else if (path.extname(binaryPath) === ".exe") {
      return resolve(binaryPath);
    }
    // Windows binary finding
    var appName = normalizeBinary.appNames[app + " on windows"];

    // this is used when reading the registry goes wrong.
    function fallBack () {
      var programFilesVar = "ProgramFiles";
      if (arch === "(64)") {
        programFilesVar = "ProgramFiles(x86)";
      }
      resolve(path.join(process.env[programFilesVar], appName, "firefox.exe"));
    }

    var rootKey = "\\Software\\Mozilla\\";
    if (arch === "(64)") {
      rootKey = "\\Software\\Wow6432Node\\Mozilla";
    }
    rootKey = path.join(rootKey, appName);

    return when.promise(function(resolve, reject) {
      var versionKey = new Winreg({
        hive: Winreg.HKLM,
        key: rootKey
      });
      versionKey.get("CurrentVersion", function(err, key) {
        var isOk = key && !err;
        return isOk ? resolve(key.value) : reject();
      });
    }).then(function(version) {
      var mainKey = new Winreg({
        hive: Winreg.HKLM,
        key: path.join(rootKey, version, "Main")
      });
      mainKey.get("PathToExe", function(err, key) {
        if (err) {
          fallBack();
          return;
        }
        resolve(key.value);
      });
    }, fallBack);
  });
}

normalizeBinary.paths = {
  "firefox on osx": "/Applications/Firefox.app/Contents/MacOS/firefox-bin",
  "beta on osx": "/Applications/FirefoxBeta.app/Contents/MacOS/firefox-bin",
  "firefoxdeveloperedition on osx": "/Applications/FirefoxDeveloperEdition.app/Contents/MacOS/firefox-bin",
  "aurora on osx": "/Applications/FirefoxAurora.app/Contents/MacOS/firefox-bin",
  "nightly on osx": "/Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin",
};

normalizeBinary.appNames = {
  "firefox on linux": "firefox",
  "beta on linux": "firefox-beta",
  "aurora on linux": "firefox-aurora",
  "nightly on linux": "firefox-nightly",
  "firefox on windows": "Mozilla Firefox",
  // the default path in the beta installer is the same as the stable one
  "beta on windows": "Mozilla Firefox",
  "aurora on windows": "Aurora",
  "nightly on windows": "Nightly"
};

exports.normalizeBinary = normalizeBinary;

function findMacAppByChannel(channel, opt) {
  // Try to find an installed app on Mac OS X for this channel.
  opt = opt || {
    spawnSync: defaultSpawnSync,
  };
  // Example: mdfind "kMDItemCFBundleIdentifier == 'org.mozilla.nightly'"
  var results = opt.spawnSync(
    "mdfind", ["kMDItemCFBundleIdentifier == 'org.mozilla." + channel + "'"]
  );
  var result = null;
  if (results.stdout) {
    var allMatches = results.stdout.toString().split("\n");
    var officialApp = allMatches.filter(function(path) {
      // Prefer the one installed in the official app location:
      return path.indexOf("/Applications/") === 0;
    })[0];

    if (officialApp) {
      result = officialApp;
    } else {
      // Fall back to the first mdfind match.
      result = allMatches[0];
    }
  }

  return result;
}

exports.findMacAppByChannel = findMacAppByChannel;
