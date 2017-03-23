'use strict';

exports.__esModule = true;
exports.storeShape = exports.subscriptionShape = undefined;

var _react = require('react');

var subscriptionShape = exports.subscriptionShape = _react.PropTypes.shape({
  trySubscribe: _react.PropTypes.func.isRequired,
  tryUnsubscribe: _react.PropTypes.func.isRequired,
  notifyNestedSubs: _react.PropTypes.func.isRequired,
  isSubscribed: _react.PropTypes.func.isRequired
});

var storeShape = exports.storeShape = _react.PropTypes.shape({
  subscribe: _react.PropTypes.func.isRequired,
  dispatch: _react.PropTypes.func.isRequired,
  getState: _react.PropTypes.func.isRequired
});