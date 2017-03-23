# testing

### dependencies
To run the tests in this directory, first install the dev dependencies with this command from the top-level directory:

```
npm install --dev
```

You'll also have to globally install [mocha](http://visionmedia.github.io/mocha). `npm install mocha -g`.

### running
First open up a [Firefox Nightly build](http://nightly.mozilla.org/) and serve the test files up:

```
node server.js &
```

visit the url the server tells you to visit.

Finally, run the tests with:

```
mocha test-dom.js --timeout 10000
````

The increased timeout is to give you enough time to manually verify the incoming connection in Firefox.

Right now you have to run each test individually, until Firefox [bug 891003](https://bugzilla.mozilla.org/show_bug.cgi?id=891003) is fixed.
