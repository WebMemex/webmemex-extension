'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ActionsObservable = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Observable2 = require('rxjs/Observable');

var _of2 = require('rxjs/observable/of');

var _from2 = require('rxjs/observable/from');

var _filter = require('rxjs/operator/filter');

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