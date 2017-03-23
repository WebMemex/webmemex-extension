var test = require('tap').test;
var docuri = require('..');

test('named parameter', function(t) {
  var page = docuri.route('page/:id');

  t.equal(page('page/mypage', { id: 'otherpage' }), 'page/otherpage', 'merged page has "id" set to "otherpage"');

  t.end();
});

test('optional parameter', function(t) {
  var page = docuri.route('page(/:id)');

  t.deepEqual(page('page/mypage'), { id: 'mypage' }, 'parsed page has "id" set to "mypage"');
  t.equal(page('page/mypage', { id: 'otherpage' }), 'page/otherpage', 'merged page has "id" set to "otherpage"');

  t.end();
});

test('two named parameters', function(t) {
  var content = docuri.route('page/:page_id/content/:id');

  t.equal(content('page/mypage/content/mycontent', { id: 'othercontent' }), 'page/mypage/content/othercontent', 'merged content has "id" set to "othercontent"');

  t.end();
});
