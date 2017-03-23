'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WeekNumber = _react2.default.createClass({
  displayName: 'WeekNumber',

  propTypes: {
    weekNumber: _react2.default.PropTypes.number.isRequired
  },

  render: function render() {
    return _react2.default.createElement(
      'div',
      {
        className: 'react-datepicker__week-number',
        'aria-label': 'week-' + this.props.weekNumber },
      this.props.weekNumber
    );
  }
});

module.exports = WeekNumber;
