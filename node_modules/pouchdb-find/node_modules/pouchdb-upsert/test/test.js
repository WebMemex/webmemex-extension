'use strict';

var Pouch = require('pouchdb-memory');

var thePlugin = require('../');
Pouch.plugin(thePlugin);

var chai = require('chai');
chai.use(require("chai-as-promised"));

var should = chai.should();
var Promise = require('bluebird');

var dbs;
if (process.browser) {
  dbs = 'testdb' + Math.random() +
    ',http://localhost:5984/testdb' + Math.round(Math.random() * 100000);
} else {
  dbs = process.env.TEST_DB;
}

dbs.split(',').forEach(function (db) {
  var dbType = /^http/.test(db) ? 'http' : 'local';
  tests(db, dbType);
});

function setTimeoutPromise(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

function tests(dbName, dbType) {

  var db;

  beforeEach(function () {
    this.timeout(30000);
    db = new Pouch(dbName);
    return db;
  });
  afterEach(function () {
    this.timeout(30000);
    return db.destroy();
  });
  describe(dbType + ': basic test suite', function () {
    this.timeout(30000);

    it('should upsert a new doc', function () {
      return db.upsert('myid', function () {
        return {some: 'doc'};
      }).then(function (res) {
        res.updated.should.equal(true);
        res.rev.should.match(/1-/);
        return db.get('myid');
      }).then(function (doc) {
        should.exist(doc._rev);
        delete doc._rev;
        doc.should.deep.equal({
          _id: 'myid',
          some: 'doc'
        });
      });
    });

    it('should upsert a new doc, with callbacks', function (done) {
      return db.upsert('myid', function () {
        return {some: 'doc'};
      }, function (err) {
        if (err) {
          return done(err);
        }
        db.get('myid', function (err, doc) {
          if (err) {
            return done(err);
          }
          should.exist(doc._rev);
          delete doc._rev;
          doc.should.deep.equal({
            _id: 'myid',
            some: 'doc'
          });
          done();
        });
      });
    });

    it('should upsert a new doc in parallel', function () {

      function diff() {
        return {some: 'doc'};
      }

      var promises = [
        db.upsert('myid', diff),
        db.upsert('myid', diff),
        db.upsert('myid', diff)
      ];

      return Promise.all(promises).then(function () {
        return db.get('myid');
      }).then(function (doc) {
        should.exist(doc._rev);
        delete doc._rev;
        doc.should.deep.equal({
          _id: 'myid',
          some: 'doc'
        });
      });
    });

    it('should upsert a new doc in parallel, still gen-1', function () {

      function diff(doc) {
        if (doc.version) {
          return false;
        }
        return {version: 1};
      }

      var promises = [
        db.upsert('myid', diff),
        db.upsert('myid', diff),
        db.upsert('myid', diff)
      ];

      return Promise.all(promises).then(function () {
        return db.get('myid');
      }).then(function (doc) {
        doc._rev.should.match(/1-/); // still gen-1
        delete doc._rev;
        doc.should.deep.equal({
          _id: 'myid',
          version: 1
        });
      });
    });

    it('should throw if no doc _id', function () {
      return db.upsert({}, function () {
        return {some: 'doc'};
      }).then(function (res) {
        res.updated.should.equal(true);
        res.rev.should.match(/1-/);
        throw new Error('should not be here');
      }, function (err) {
        should.exist(err);
      });
    });

    it('should upsert an existing doc', function () {
      return db.upsert('myid', function () {
        return {some: 'doc'};
      }).then(function (res) {
        res.updated.should.equal(true);
        res.rev.should.match(/1-/);
        return db.upsert('myid', function (doc) {
          doc.version = 2;
          return doc;
        });
      }).then(function (res) {
        res.updated.should.equal(true);
        res.rev.should.match(/2-/);
        return db.get('myid');
      }).then(function (doc) {
        should.exist(doc._rev);
        delete doc._rev;
        doc.should.deep.equal({
          _id: 'myid',
          some: 'doc',
          version: 2
        });
      });
    });

    it('should not upsert if diffFun returns falsy', function () {
      return db.upsert('myid', function () {
        return {some: 'doc'};
      }).then(function (res) {
        res.updated.should.equal(true);
        res.rev.should.match(/1-/);
        return db.upsert('myid', function () {
          return false;
        });
      }).then(function (res) {
        res.updated.should.equal(false);
        res.rev.should.match(/1-/);
        return db.get('myid');
      }).then(function (doc) {
        should.exist(doc._rev);
        delete doc._rev;
        doc.should.deep.equal({
          _id: 'myid',
          some: 'doc'
        });
      });
    });

    it('should create a new doc, with sugar', function () {
      return db.putIfNotExists({_id: 'foo', hey: 'yo'}).then(function (res) {
        res.updated.should.equal(true);
        res.rev.should.match(/1-/);
        return db.get('foo');
      }).then(function (doc) {
        should.exist(doc._rev);
        delete doc._rev;
        doc.should.deep.equal({
          _id: 'foo',
          hey: 'yo'
        });
      });
    });

    it('should create a new doc, with sugar and callbacks', function (done) {
      db.putIfNotExists({_id: 'foo', hey: 'yo'}, function (err) {
        if (err) {
          return done(err);
        }
        db.get('foo', function (err, doc) {
          if (err) {
            return done(err);
          }
          should.exist(doc._rev);
          delete doc._rev;
          doc.should.deep.equal({
            _id: 'foo',
            hey: 'yo'
          });
          done();
        });
      });
    });

    it('should create a new doc, with sugar and callbacks 2', function (done) {
      db.putIfNotExists('foo', {hey: 'yo'}, function (err) {
        if (err) {
          return done(err);
        }
        db.get('foo', function (err, doc) {
          if (err) {
            return done(err);
          }
          should.exist(doc._rev);
          delete doc._rev;
          doc.should.deep.equal({
            _id: 'foo',
            hey: 'yo'
          });
          done();
        });
      });
    });

    it('should not recreate a doc, with sugar', function () {
      return db.putIfNotExists({_id: 'foo', hey: 'yo'}).then(function (res) {
        res.updated.should.equal(true);
        res.rev.should.match(/1-/);
        return db.putIfNotExists({_id: 'foo', another: 'thing'});
      }).then(function () {
        return db.get('foo');
      }).then(function (doc) {
        doc._rev.should.match(/1-/);
        delete doc._rev;
        doc.should.deep.equal({
          _id: 'foo',
          hey: 'yo'
        });
      });
    });

    it('should not recreate a doc, with sugar 2', function () {
      return db.putIfNotExists('foo', {hey: 'yo'}).then(function (res) {
        res.updated.should.equal(true);
        res.rev.should.match(/1-/);
        return db.putIfNotExists('foo', {another: 'thing'});
      }).then(function () {
        return db.get('foo');
      }).then(function (doc) {
        doc._rev.should.match(/1-/);
        delete doc._rev;
        doc.should.deep.equal({
          _id: 'foo',
          hey: 'yo'
        });
      });
    });

    it('should not recreate a doc, with sugar, in parallel', function () {

      var promises = [
        db.putIfNotExists('foo', {hey: 'yo'}),
        db.putIfNotExists('foo', {hey: 'yo'}),
        db.putIfNotExists('foo', {hey: 'yo'})
      ];

      return Promise.all(promises).then(function () {
        return db.get('foo');
      }).then(function (doc) {
        doc._rev.should.match(/1-/);
        delete doc._rev;
        doc.should.deep.equal({
          _id: 'foo',
          hey: 'yo'
        });
      });
    });

    it('should not recreate a doc, with sugar, first wins', function () {

      var promises = [
        db.putIfNotExists('foo', {hey: 'yo'}),
        setTimeoutPromise(500).then(function () {
          return db.putIfNotExists('foo', {hey: 'dude'});
        }),
        setTimeoutPromise(1000).then(function () {
          return db.putIfNotExists('foo', {hey: 'sista'});
        })
      ];

      return Promise.all(promises).then(function () {
        return db.get('foo');
      }).then(function (doc) {
        doc._rev.should.match(/1-/);
        delete doc._rev;
        doc.should.deep.equal({
          _id: 'foo',
          hey: 'yo'
        });
      });
    });

    it('should not allow users to mutate the original doc', function () {

      return db.put({_id: 'foo'}).then(function () {
        return db.upsert('foo', function (doc) {
          doc._rev = 'uh oh a bad rev!';
          doc._id = 'whoops I messed up the id too!';
          doc.newValue = 'newValue';
          return doc;
        });
      }).then(function () {
        return db.get('foo');
      }).then(function (doc) {
        doc._id.should.equal('foo');
        doc._rev.should.match(/^2-/); // 2nd-gen
        doc.newValue.should.equal('newValue');
      });
    });

    it('should pass the right _id/_rev into the diffFun', function () {

      var rev1;
      var id1;
      var rev2;
      var id2;

      return db.upsert('foo', function (doc) {
        rev1 = doc._rev;
        id1 = doc._id;
        return doc;
      }).then(function () {
        return db.upsert('foo', function (doc) {
          rev2 = doc._rev;
          id2 = doc._id;
          return doc;
        });
      }).then(function () {
        should.not.exist(rev1);
        should.not.exist(id1);
        rev2.should.match(/^1-/); // first-gen
        id2.should.equal('foo');
      });
    });

    it('errors thrown in diff function shouldn\'t crash the system', function () {
      return db.upsert('foo', function () {
        throw new Error("An upsert diff error.");
      }).then(function () {
        throw new Error("Finished upsert without throwing error.");
      }, function (e) {
        should.exist(e);
      });
    });

  });
}
