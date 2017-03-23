'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEpicMiddleware = createEpicMiddleware;

var _Subject = require('rxjs/Subject');

var _map = require('rxjs/operator/map');

var _switchMap = require('rxjs/operator/switchMap');

var _ActionsObservable = require('./ActionsObservable');

var _EPIC_END = require('./EPIC_END');

var defaultAdapter = {
  input: function input(action$) {
    return action$;
  },
  output: function output(action$) {
    return action$;
  }
};

var defaultOptions = {
  adapter: defaultAdapter
};

function createEpicMiddleware(epic) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultOptions,
      _ref$adapter = _ref.adapter,
      adapter = _ref$adapter === undefined ? defaultAdapter : _ref$adapter;

  if (typeof epic !== 'function') {
    throw new TypeError('You must provide a root Epic to createEpicMiddleware');
  }

  var input$ = new _Subject.Subject();
  var action$ = adapter.input(new _ActionsObservable.ActionsObservable(input$));
  var epic$ = new _Subject.Subject();
  var store = void 0;

  var epicMiddleware = function epicMiddleware(_store) {
    store = _store;

    return function (next) {
      var _context;

      (_context = _map.map.call(epic$, function (epic) {
        var output$ = epic(action$, store);
        if (!output$) {
          throw new TypeError('Your root Epic "' + (epic.name || '<anonymous>') + '" does not return a stream. Double check you\'re not missing a return statement!');
        }
        return output$;
      }), _switchMap.switchMap).call(_context, function (output$) {
        return adapter.output(output$);
      }).subscribe(store.dispatch);

      // Setup initial root epic
      epic$.next(epic);

      return function (action) {
        var result = next(action);
        input$.next(action);
        return result;
      };
    };
  };

  epicMiddleware.replaceEpic = function (epic) {
    // gives the previous root Epic a last chance
    // to do some clean up
    store.dispatch({ type: _EPIC_END.EPIC_END });
    // switches to the new root Epic, synchronously terminating
    // the previous one
    epic$.next(epic);
  };

  return epicMiddleware;
}