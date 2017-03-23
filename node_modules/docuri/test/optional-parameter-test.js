var test = require('tap').test;
var docuri = require('..');

test('optional parameter', function(t) {
  var page = docuri.route('page(/:id)');

  t.deepEqual(page('page'), {}, 'parsed page returns empty object');
  t.deepEqual(page('page/mypage'), { id: 'mypage' }, 'parsed page has "id" set to "mypage"');
  t.equal(page(), 'page', 'stringified empty page results in "page"');
  t.equal(page({ id: 'mypage' }), 'page/mypage', 'stringified page results in "page/mypage"');

  t.end();
});

test('surrounded optional parameter', function(t) {
  var page = docuri.route('page(/:id)/suffix');

  t.deepEqual(page('page/suffix'), {}, 'parsed page returns empty object');
  t.deepEqual(page('page/mypage/suffix'), { id: 'mypage' }, 'parsed page has "id" set to "mypage"');
  t.equal(page(), 'page/suffix', 'stringified empty page results in "page"');
  t.equal(page({ id: 'mypage' }), 'page/mypage/suffix', 'stringified page results in "page/mypage"');

  t.end();
});

test('optional parameter with trailing slash', function(t) {
  var page = docuri.route('(:id/)page');

  t.deepEqual(page('page'), {}, 'parsed page returns empty object');
  t.deepEqual(page('mypage/page'), { id: 'mypage' }, 'parsed page has "id" set to "mypage"');
  t.equal(page(), 'page', 'stringified empty page results in "page"');
  t.equal(page({ id: 'mypage' }), 'mypage/page', 'stringified page results in "mypage/page"');

  t.end();
});
