'use strict';

var babel = require('babel-core'),
  fs = require('fs');

// es5 build
babel.transformFile('./src/index.js', function(err, result) {
  if (err) throw err;

  var filename = './lib/index.js';
  fs.writeFile(filename, result.code, onWriteCompleted(filename));
});

// jsnext build

var jsnextOpts = {
  presets: [ [ 'es2015', { modules: false } ] ],
  babelrc: false
};

babel.transformFile('./src/index.js', jsnextOpts, function(err, result) {
  if (err) throw err;

  var filename = './lib/index.jsnext.js';
  fs.writeFile(filename, result.code, onWriteCompleted(filename));
});

function onWriteCompleted(filename) {
  return function(err) {
    if (err) throw err;
    console.log(filename + ' written');
  }
}
