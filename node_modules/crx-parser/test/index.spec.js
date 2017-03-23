var parseCRX = require('../src');

var assert = require('assert');
var fs = require('fs');
var createReadStream = require('streamifier').createReadStream;
var unzip = require('unzip');
var concat = require('concat-stream');
var once = require('once');

var expectedPublicKey = [
  "-----BEGIN PUBLIC KEY-----",
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8vj7SK0NZ6ak7K6m6KEA",
  "kfGaNfKUahqFFms6W8rq+voaW7nETrpsMqNyhmBQ+ea0KkyI/S5XIrDQPqDcNpve",
  "sYlg9lsmi7CQBZjJw7zNqKkvn0oYaP4SNtWZfZopBumqFbzFi5cst2PT+XU9CBit",
  "xXNtocRtcjOsa44W1gPA5xanmtlF258N6Nann+rSOAdhIWqSo/J6fj72cxTNfmqL",
  "kwAvhdS4Zyux4F87vxp4YTSwElfYXFsHZWi7h66uuuMzqyOyJz5grhCJ24rtTshM",
  "QUCxQWyhO2XT2J1tVfUN1YVw6xdKUz3aGyKZeXCuql5klHmlqE9PTlbKj/1VMiIg",
  "CQIDAQAB",
  "-----END PUBLIC KEY-----"
].filter(function (l) {
    return l.indexOf('-');
  }).join('');

function getManifest(zipArchive, cb) {
  cb = once(cb);
  createReadStream(zipArchive)
    .pipe(unzip.Parse())
    .on('error', function (e) {
      cb(e);
    })
    .on('entry', function (entry) {
      var fileName = entry.path;
      if (fileName === "manifest.json") {
        entry.pipe(concat({encoding: 'string'}, function (o) {
          cb(null, JSON.parse(o));
        }));
      } else {
        entry.autodrain();
      }
    })
    .on('end', function () {
      cb(new Error('manifest.json not found'));
    });
}

fs.readFile(__dirname + '/fixture/mfabfdnimhipcapcioneheloaehhoggk.crx',
  function (err, buff) {
    assert(!err, err);
    parseCRX(buff, function (err, data) {
      assert(!err, err);
      assert.equal(data.header.publicKey, expectedPublicKey);
      getManifest(data.body, function (err, manifest) {
        assert(!err, err);
        assert.equal(manifest.version, '0.1.0')
      });
    });
  });

