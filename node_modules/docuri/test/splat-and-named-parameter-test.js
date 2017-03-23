var test = require('tap').test;
var docuri = require('..');

test('splat and named parameter', function(t) {
  var page = docuri.route('*splat/page/:named');

  t.deepEqual(page('splat/page/named'), { splat: [ 'splat' ], named: 'named' }, 'splat and named parameter parsed correctly');
  t.equal(page({ splat: [ 'splat' ], named: 'named' }), 'splat/page/named', 'stringified result is in right order');

  t.end();
});

