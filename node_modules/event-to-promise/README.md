# event-to-promise

[![Build Status](https://img.shields.io/travis/julien-f/event-to-promise/master.svg)](http://travis-ci.org/julien-f/event-to-promise)
[![Dependency Status](https://david-dm.org/julien-f/event-to-promise/status.svg?theme=shields.io)](https://david-dm.org/julien-f/event-to-promise)
[![devDependency Status](https://david-dm.org/julien-f/event-to-promise/dev-status.svg?theme=shields.io)](https://david-dm.org/julien-f/event-to-promise#info=devDependencies)

> Create a promise waiting for an event


## Install

Download [manually](https://github.com/julien-f/event-to-promise/releases) or with package-manager.

#### [npm](https://npmjs.org/package/event-to-promise)

```
npm install --save event-to-promise
```

This library requires promises support, for Node versions prior to 0.12 [see
this page](https://github.com/julien-f/js-promise-toolbox#usage) to
enable them.

## Example

```javascript
var eventToPromise = require('event-to-promise')

function createServer (port) {
  var server = require('http').createServer()
  server.listen(port)

  // The server will be returned once it has started listening.
  //
  // If an error happened, it will be forwarded instead.
  return eventToPromise(server, 'listening').then(function () {
    return server
  })
}

// Using plain promise.
createServer(80).then(function (server) {
  console.log('Server listening on http://localhost:80/')
}).catch(function (error) {
  console.error('Server could not start:', error)
})
```

Event better using [ES2016 asynchronous functions](https://github.com/tc39/ecmascript-asyncawait):

```js
import eventToPromise from 'event-to-promise'

async function createServer (port) {
  var server = require('http').createServer()
  server.listen(port)

  await eventToPromise(server, 'listening')

  return server
}

async function main () {
  try {
    const server = await createServer(80);
    console.log('Server listening on http://localhost:80/');
  } catch (error) {
    console.error('Server could not start:', error);
  }
}

main()
```

## API

### eventToPromise(emitter, event, [options]) => Promise

> Wait for one event. The first parameter of the emitted event is used
> to resolve/reject the promise.

The returned promise has a `cancel()` method which can be used to
remove the event listeners. Note that the promise will never settled
if canceled.

```js
const promise = eventToPromise(emitter, 'foo')
promise.cancel()
```

#### emitter

*Required*
Type: `Object`

The event emitter you want to watch an event on.

#### event

*Required*
Type: `string`

The name of the event you want to watch.

#### options

##### array

Type: `boolean`
Default: `false`

If true, all parameters of the emitted events are put in an array which is used to resolve/reject the promise.

##### error

Type: `string`
Default: `"error"`

The name of the event which rejects the promise.

##### ignoreErrors

Type: `boolean`
Default: `false`

Whether the error event should be ignored and not reject the promise.

### eventToPromise.multi(emitter, successEvents, errorEvents) => Promise

> Wait for one of multiple events. The array of all the parameters of
> the emitted event is used to resolve/reject the promise.
>
> The array also has an `event` property indicating which event has
> been emitted.

The returned promise has a `cancel()` method which can be used to
remove the event listeners. Note that the promise will never settled
if canceled.

```js
const promise = eventToPromise(emitter, 'foo')
promise.cancel()
```

#### emitter

*Required*
Type: `Object`

The event emitter you want to watch an event on.

#### successEvents

*Required*
Type: `Array<string>`

The names of the events which resolve the promise.

#### errorEvents

Type: `Array<string>`
Default: `[ 'error' ]`

The names of the events which reject the promise.


## Contributing

Contributions are *very* welcome, either on the documentation or on
the code.

You may:

- report any [issue](https://github.com/julien-f/event-to-promise/issues)
  you've encountered;
- fork and create a pull request.

## License

ISC © [Julien Fontanet](http://julien.isonoe.net)
