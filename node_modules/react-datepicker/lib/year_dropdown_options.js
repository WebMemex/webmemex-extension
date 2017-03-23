'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function generateYears(year, noOfYear) {
  var list = [];
  for (var i = 0; i < 2 * noOfYear; i++) {
    list.push(year + noOfYear - i);
  }
  return list;
}

var YearDropdownOptions = _react2.default.createClass({
  displayName: 'YearDropdownOptions',

  propTypes: {
    onCancel: _react2.default.PropTypes.func.isRequired,
    onChange: _react2.default.PropTypes.func.isRequired,
    scrollableYearDropdown: _react2.default.PropTypes.bool,
    year: _react2.default.PropTypes.number.isRequired
  },

  getInitialState: function getInitialState() {
    return {
      yearsList: this.props.scrollableYearDropdown ? generateYears(this.props.year, 10) : generateYears(this.props.year, 5)
    };
  },
  renderOptions: function renderOptions() {
    var _this = this;

    var selectedYear = this.props.year;
    var options = this.state.yearsList.map(function (year) {
      return _react2.default.createElement(
        'div',
        { className: 'react-datepicker__year-option',
          key: year,
          ref: year,
          onClick: _this.onChange.bind(_this, year) },
        selectedYear === year ? _react2.default.createElement(
          'span',
          { className: 'react-datepicker__year-option--selected' },
          '\u2713'
        ) : '',
        year
      );
    });

    options.unshift(_react2.default.createElement(
      'div',
      { className: 'react-datepicker__year-option',
        ref: 'upcoming',
        key: 'upcoming',
        onClick: this.incrementYears },
      _react2.default.createElement('a', { className: 'react-datepicker__navigation react-datepicker__navigation--years react-datepicker__navigation--years-upcoming' })
    ));
    options.push(_react2.default.createElement(
      'div',
      { className: 'react-datepicker__year-option',
        ref: 'previous',
        key: 'previous',
        onClick: this.decrementYears },
      _react2.default.createElement('a', { className: 'react-datepicker__navigation react-datepicker__navigation--years react-datepicker__navigation--years-previous' })
    ));
    return options;
  },
  onChange: function onChange(year) {
    this.props.onChange(year);
  },
  handleClickOutside: function handleClickOutside() {
    this.props.onCancel();
  },
  shiftYears: function shiftYears(amount) {
    var years = this.state.yearsList.map(function (year) {
      return year + amount;
    });

    this.setState({
      yearsList: years
    });
  },
  incrementYears: function incrementYears() {
    return this.shiftYears(1);
  },
  decrementYears: function decrementYears() {
    return this.shiftYears(-1);
  },
  render: function render() {
    var dropdownClass = (0, _classnames2.default)({
      'react-datepicker__year-dropdown': true,
      'react-datepicker__year-dropdown--scrollable': this.props.scrollableYearDropdown
    });

    return _react2.default.createElement(
      'div',
      { className: dropdownClass },
      this.renderOptions()
    );
  }
});

module.exports = YearDropdownOptions;
