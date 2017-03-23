(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("rxjs/Observable"), require("rxjs/Subject"), require("rxjs/operator/filter"), require("rxjs/operator/map"), require("rxjs/operator/switchMap"), require("rxjs/observable/from"), require("rxjs/observable/merge"), require("rxjs/observable/of"));
	else if(typeof define === 'function' && define.amd)
		define(["rxjs/Observable", "rxjs/Subject", "rxjs/operator/filter", "rxjs/operator/map", "rxjs/operator/switchMap", "rxjs/observable/from", "rxjs/observable/merge", "rxjs/observable/of"], factory);
	else if(typeof exports === 'object')
		exports["ReduxObservable"] = factory(require("rxjs/Observable"), require("rxjs/Subject"), require("rxjs/operator/filter"), require("rxjs/operator/map"), require("rxjs/operator/switchMap"), require("rxjs/observable/from"), require("rxjs/observable/merge"), require("rxjs/observable/of"));
	else
		root["ReduxObservable"] = factory(root["Rx"], root["Rx"], root["Rx"]["Observable"]["prototype"], root["Rx"]["Observable"]["prototype"], root["Rx"]["Observable"]["prototype"], root["Rx"]["Observable"], root["Rx"]["Observable"], root["Rx"]["Observable"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_6__, __WEBPACK_EXTERNAL_MODULE_7__, __WEBPACK_EXTERNAL_MODULE_8__, __WEBPACK_EXTERNAL_MODULE_9__, __WEBPACK_EXTERNAL_MODULE_10__, __WEBPACK_EXTERNAL_MODULE_11__, __WEBPACK_EXTERNAL_MODULE_12__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createEpicMiddleware = __webpack_require__(4);

	Object.defineProperty(exports, 'createEpicMiddleware', {
	  enumerable: true,
	  get: function get() {
	    return _createEpicMiddleware.createEpicMiddleware;
	  }
	});

	var _ActionsObservable = __webpack_require__(1);

	Object.defineProperty(exports, 'ActionsObservable', {
	  enumerable: true,
	  get: function get() {
	    return _ActionsObservable.ActionsObservable;
	  }
	});

	var _combineEpics = __webpack_require__(3);

	Object.defineProperty(exports, 'combineEpics', {
	  enumerable: true,
	  get: function get() {
	    return _combineEpics.combineEpics;
	  }
	});

	var _EPIC_END = __webpack_require__(2);

	Object.defineProperty(exports, 'EPIC_END', {
	  enumerable: true,
	  get: function get() {
	    return _EPIC_END.EPIC_END;
	  }
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.ActionsObservable = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Observable2 = __webpack_require__(5);

	var _of2 = __webpack_require__(12);

	var _from2 = __webpack_require__(10);

	var _filter = __webpack_require__(7);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ActionsObservable = exports.ActionsObservable = function (_Observable) {
	  _inherits(ActionsObservable, _Observable);

	  _createClass(ActionsObservable, null, [{
	    key: 'of',
	    value: function of() {
	      return new this(_of2.of.apply(undefined, arguments));
	    }
	  }, {
	    key: 'from',
	    value: function from(actions, scheduler) {
	      return new this((0, _from2.from)(actions, scheduler));
	    }
	  }]);

	  function ActionsObservable(actionsSubject) {
	    _classCallCheck(this, ActionsObservable);

	    var _this = _possibleConstructorReturn(this, (ActionsObservable.__proto__ || Object.getPrototypeOf(ActionsObservable)).call(this));

	    _this.source = actionsSubject;
	    return _this;
	  }

	  _createClass(ActionsObservable, [{
	    key: 'lift',
	    value: function lift(operator) {
	      var observable = new ActionsObservable(this);
	      observable.operator = operator;
	      return observable;
	    }
	  }, {
	    key: 'ofType',
	    value: function ofType() {
	      for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
	        keys[_key] = arguments[_key];
	      }

	      return _filter.filter.call(this, function (_ref) {
	        var type = _ref.type;

	        var len = keys.length;
	        if (len === 1) {
	          return type === keys[0];
	        } else {
	          for (var i = 0; i < len; i++) {
	            if (keys[i] === type) {
	              return true;
	            }
	          }
	        }
	        return false;
	      });
	    }
	  }]);

	  return ActionsObservable;
	}(_Observable2.Observable);

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var EPIC_END = exports.EPIC_END = '@@redux-observable/EPIC_END';

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.combineEpics = undefined;

	var _merge = __webpack_require__(11);

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	/**
	  Merges all epics into a single one.
	 */
	var combineEpics = exports.combineEpics = function combineEpics() {
	  for (var _len = arguments.length, epics = Array(_len), _key = 0; _key < _len; _key++) {
	    epics[_key] = arguments[_key];
	  }

	  return function () {
	    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	      args[_key2] = arguments[_key2];
	    }

	    return _merge.merge.apply(undefined, _toConsumableArray(epics.map(function (epic) {
	      var output$ = epic.apply(undefined, args);
	      if (!output$) {
	        throw new TypeError('combineEpics: one of the provided Epics "' + (epic.name || '<anonymous>') + '" does not return a stream. Double check you\'re not missing a return statement!');
	      }
	      return output$;
	    })));
	  };
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.createEpicMiddleware = createEpicMiddleware;

	var _Subject = __webpack_require__(6);

	var _map = __webpack_require__(8);

	var _switchMap = __webpack_require__(9);

	var _ActionsObservable = __webpack_require__(1);

	var _EPIC_END = __webpack_require__(2);

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

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_7__;

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_8__;

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_9__;

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_10__;

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_11__;

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_12__;

/***/ }
/******/ ])
});
;