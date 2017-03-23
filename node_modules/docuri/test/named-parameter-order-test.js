var shuffle = require('shuffle-array');
var test = require('tap').test;
var docuri = require('..');

var simulateWrongOrderObjectKeys = function(cb){
  var orig = Object.keys;
  Object.keys = function(obj){
    var keys = orig(obj);
    var real = keys.toString();
    while (real === keys.toString())
      shuffle(keys);
    return keys;
  };
  try {
    cb();
  } catch (err) {
    Object.keys = orig;
    throw err;
  }
  Object.keys = orig;
};

test('named parameters are not reliant on Object.keys order', function(t) {
  var page = docuri.route('page/:foo/:bar/:quux/:baz');

  simulateWrongOrderObjectKeys(function(){
    t.deepEqual(
      page('page/1/2/3/4'),
      { foo: '1', bar: '2', quux: '3', baz: '4' },
      'does not rely on Object.keys order',
      { todo: true }
    );
  });

  t.end();
});
