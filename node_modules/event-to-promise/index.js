'use strict'

// ===================================================================

function noop () {}

function makeEventAdder (emitter, arrayArg) {
  var addListener =
    emitter.addEventListener ||
    emitter.addListener ||
    emitter.on

  if (!addListener) {
    throw new Error('cannot register an event listener')
  }

  var removeListener =
    emitter.removeEventListener ||
    emitter.removeListener ||
    emitter.off

  var eventsAndListeners = []

  var cleanUp = removeListener
    ? function () {
      for (var i = 0, n = eventsAndListeners.length; i < n; i += 2) {
        removeListener.call(emitter, eventsAndListeners[i], eventsAndListeners[i + 1])
      }
    }
    : noop

  function addEvent (event, cb) {
    function listener () {
      cleanUp()

      var arg
      var n = arguments.length
      if (arrayArg) {
        arg = new Array(n)
        for (var i = 0; i < n; ++i) {
          arg[i] = arguments[i]
        }
        arg.event = event
      } else {
        arg = n > 0 ? arguments[0] : undefined
      }

      cb(arg)
    }

    eventsAndListeners.push(event, listener)
    addListener.call(emitter, event, listener)
  }
  addEvent.cleanUp = cleanUp

  return addEvent
}

// ===================================================================

function eventToPromise (emitter, event, opts) {
  var cancel
  var promise = new Promise(function (resolve, reject) {
    var addEvent = makeEventAdder(emitter, opts && opts.array)
    cancel = function () {
      cancel = noop
      addEvent.cleanUp()
    }

    addEvent(event, resolve)

    if (!opts || !opts.ignoreErrors) {
      addEvent(opts && opts.error || 'error', reject)
    }
  })
  promise.cancel = function () { return cancel() }

  return promise
}

var defaultErrorEvents = [ 'error' ]
eventToPromise.multi = function eventsToPromise (emitter, successEvents, errorEvents) {
  errorEvents || (errorEvents = defaultErrorEvents)

  var cancel
  var promise = new Promise(function (resolve, reject) {
    var addEvent = makeEventAdder(emitter, true)
    cancel = function () {
      cancel = noop
      addEvent.cleanUp()
    }

    var i, n
    for (i = 0, n = successEvents.length; i < n; ++i) {
      addEvent(successEvents[i], resolve)
    }
    for (i = 0, n = errorEvents.length; i < n; ++i) {
      addEvent(errorEvents[i], reject)
    }
  })
  promise.cancel = function () { return cancel() }

  return promise
}

module.exports = eventToPromise
