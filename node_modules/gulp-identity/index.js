var through = require('through2');


module.exports = function () {
  return through.obj(function (file, enc, cb) {
    this.push(file);
    return cb();
  });
};
