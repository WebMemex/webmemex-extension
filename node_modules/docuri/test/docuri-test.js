var test = require('tap').test;
var docuri = require('..');

test('simple route', function(t) {
  var page = docuri.route('page');

  t.deepEqual(page('page'), {}, 'parsed page returns empty object');
  t.equal(page('image'), false, 'parsed image returns false');
  t.equal(page(), 'page', 'generate page url');

  t.end();
});

