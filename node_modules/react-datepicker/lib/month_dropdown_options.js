'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MonthDropdownOptions = _react2.default.createClass({
  displayName: 'MonthDropdownOptions',

  propTypes: {
    onCancel: _react2.default.PropTypes.func.isRequired,
    onChange: _react2.default.PropTypes.func.isRequired,
    month: _react2.default.PropTypes.number.isRequired,
    monthNames: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.string.isRequired).isRequired
  },

  renderOptions: function renderOptions() {
    var _this = this;

    var selectedMonth = this.props.month;
    var options = this.props.monthNames.map(function (month, i) {
      return _react2.default.createElement(
        'div',
        { className: 'react-datepicker__month-option',
          key: month,
          ref: month,
          onClick: _this.onChange.bind(_this, i) },
        selectedMonth === i ? _react2.default.createElement(
          'span',
          { className: 'react-datepicker__month-option--selected' },
          '\u2713'
        ) : '',
        month
      );
    });

    return options;
  },
  onChange: function onChange(month) {
    this.props.onChange(month);
  },
  handleClickOutside: function handleClickOutside() {
    this.props.onCancel();
  },
  render: function render() {
    return _react2.default.createElement(
      'div',
      { className: 'react-datepicker__month-dropdown' },
      this.renderOptions()
    );
  }
});

module.exports = MonthDropdownOptions;
