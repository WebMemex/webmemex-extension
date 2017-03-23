PouchDB Upsert
=====

[![Build Status](https://travis-ci.org/pouchdb/upsert.svg)](https://travis-ci.org/pouchdb/upsert)

A tiny plugin for PouchDB that provides two convenience methods:

* `upsert()` - update a document, or insert a new one if it doesn't exist ("upsert"). Will keep retrying (forever) if it gets 409 conflicts.
* `putIfNotExists()` - create a new document if it doesn't exist. Does nothing if it already exists.

So basically, if you're tired of manually dealing with 409s or 404s in your PouchDB code, then this is the plugin for you.

Installation
------

### Browser

```
bower install pouchdb-upsert
```

Or download from the `dist/` folder and include it after `pouchdb.js`:

```html
<script src="pouchdb.js"></script>
<script src="pouchdb.upsert.js"></script>
```

### Node.js

```
npm install pouchdb-upsert
```

Then attach it to the `PouchDB` object:

```js
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-upsert'));
```

API
--------


### Overview

* [`db.upsert(docId, diffFunc [, callback])`](#dbupsertdocid-difffunc--callback)
* [`db.putIfNotExists([docId, ] doc [, callback])`](#dbputifnotexistsdocid--doc--callback)

### db.upsert(docId, diffFunc [, callback])

Perform an upsert (update or insert) operation. If you don't specify a `callback`, then this function returns a Promise.

* `docId` - the `_id` of the document.
* `diffFunc` - function that takes the existing doc as input and returns an updated doc.
  * If this `diffFunc` returns falsey, then the update won't be performed (as an optimization).
  * If the document does not already exist, then `{}` will be the input to `diffFunc`.

**Note:** By design, the goal of this repo is to just provide a handler for synchronized logic. ```diffFunc``` must not make asynchronous calls.

##### Example 1

A doc with a basic counter:

```js
db.upsert('myDocId', function (doc) {
  if (!doc.count) {
    doc.count = 0;
  }
  doc.count++;
  return doc;
}).then(function (res) {
  // success, res is {rev: '1-xxx', updated: true}
}).catch(function (err) {
  // error
});
```

Resulting doc (after 1 `upsert`):

```js
{
  _id: 'myDocId',
  _rev: '1-cefef1ec19869d9441a47021f3fd4710',
  count: 1
}
```

Resulting doc (after 3 `upsert`s):

```js
{
  _id: 'myDocId',
  _rev: '3-536ef59f3ed17a181dc683a255caf1d9',
  count: 3
}
```

##### Example 2

A `diffFunc` that only updates the doc if it's missing a certain field:

```js
db.upsert('myDocId', function (doc) {
  if (!doc.touched) {
    doc.touched = true;
    return doc;
  }
  return false; // don't update the doc; it's already been "touched"
}).then(function (res) {
  // success, res is {rev: '1-xxx', updated: true}
}).catch(function (err) {
  // error
});
```

Resulting doc:

```js
{
  _id: 'myDocId',
  _rev: '1-cefef1ec19869d9441a47021f3fd4710',
  touched: true
}
```

The next time you try to `upsert`, the `res` will be `{rev: '1-xxx', updated: false}`. The `updated: false` indicates that the `upsert` function did not actually update the document, and the `rev` returned will be the previous winning revision.

##### Example 3

You can also return a new object. The `_id` and `_rev` are added automatically:

```js
db.upsert('myDocId', function (doc) {
  return {thisIs: 'awesome!'};
}).then(function (res) {
  // success, res is {rev: '1-xxx', updated: true}
}).catch(function (err) {
  // error
});
```

Resulting doc:

```js
{
  _id: 'myDocId',
  _rev: '1-cefef1ec19869d9441a47021f3fd4710',
  thisIs: 'awesome!'
}
```

### db.putIfNotExists([docId, ] doc [, callback])

Put a new document with the given `docId`, if it doesn't already exist. If you don't specify a `callback`, then this function returns a Promise.

* `docId` - the `_id` of the document. Optional if you already include it in the `doc`
* `doc` - the document to insert. Should contain an `_id` if `docId` is not specified

If the document already exists, then the Promise will just resolve immediately.

##### Example 1

Put a doc if it doesn't exist

```js
db.putIfNotExists('myDocId', {yo: 'dude'}).then(function (res) {
  // success, res is {rev: '1-xxx', updated: true}
}).catch(function (err) {
  // error
});
```

Resulting doc:

```js
{
  _id: 'myDocId',
  _rev: '1-cefef1ec19869d9441a47021f3fd4710',
  yo: 'dude'
}
```

If you call `putIfNotExists` multiple times, then the document will not be updated the 2nd, 3rd, or 4th time (etc.).

If it's not updated, then the `res` will be `{rev: '1-xxx', updated: false}`, where `rev` is the first revision and `updated: false` indicates that it wasn't updated.

##### Example 2

You can also just include the `_id` inside the document itself:

```js
db.putIfNotExists({_id: 'myDocId', yo: 'dude'}).then(function (res) {
  // success, res is {rev: '1-xxx', updated: true}
}).catch(function (err) {
  // error
});
```

Resulting doc (same as example 1):

```js
{
  _id: 'myDocId',
  _rev: '1-cefef1ec19869d9441a47021f3fd4710',
  yo: 'dude'
}
```

Breaking changes
----

* 2.0.0: breaks compatibility with PouchDB <4.0.1, see [#9](https://github.com/pouchdb/upsert/pull/9) for details.


Building
----
    npm install
    npm run build


Testing
----

### In Node

This will run the tests in Node using LevelDB:

    npm test

You can also check for 100% code coverage using:

    npm run coverage


If you have mocha installed globally you can run single test with:
```
TEST_DB=local mocha --reporter spec --grep search_phrase
```

The `TEST_DB` environment variable specifies the database that PouchDB should use (see `package.json`).

### Automated browser tests in PhantomJS

    npm run test-browser

### Debugging in the browser

    npm run test-local
