var assert = require('assert');
var git = require('../index');

var result;

result = git.short();
assert.equal(result.length, 7, 'short() returns string of length 7');

result = git.long();
assert.equal(result.length, 40, 'long() returns string of length 7');

result = git.branch();
assert.equal(!!result.length, true, 'branch() returns a string with non-zero length');

result = git.message();
assert.equal(!!result.length, true, 'message() returns a string with non-zero length');

result = git.tag();
assert.equal(!!result.length, true, 'tag() returns a string with non-zero length');

result = git.count();
assert.notEqual(result, 0, 'count() returns a non-zero number');
assert.equal(Math.abs(result), result, 'count() returns a positive number');

result = git.isTagDirty();
assert.equal(typeof result, 'boolean', 'isTagDirty() returns a boolean');

console.log('tests passed');
