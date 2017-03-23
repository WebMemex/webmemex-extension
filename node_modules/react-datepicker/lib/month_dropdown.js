'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _month_dropdown_options = require('./month_dropdown_options');

var _month_dropdown_options2 = _interopRequireDefault(_month_dropdown_options);

var _reactOnclickoutside = require('react-onclickoutside');

var _reactOnclickoutside2 = _interopRequireDefault(_reactOnclickoutside);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WrappedMonthDropdownOptions = (0, _reactOnclickoutside2.default)(_month_dropdown_options2.default);

var MonthDropdown = _react2.default.createClass({
  displayName: 'MonthDropdown',

  propTypes: {
    dropdownMode: _react2.default.PropTypes.oneOf(['scroll', 'select']).isRequired,
    locale: _react2.default.PropTypes.string,
    month: _react2.default.PropTypes.number.isRequired,
    onChange: _react2.default.PropTypes.func.isRequired
  },

  getInitialState: function getInitialState() {
    return {
      dropdownVisible: false
    };
  },
  renderSelectOptions: function renderSelectOptions(monthNames) {
    return monthNames.map(function (M, i) {
      return _react2.default.createElement(
        'option',
        { key: i, value: i },
        M
      );
    });
  },
  renderSelectMode: function renderSelectMode(monthNames) {
    var _this = this;

    return _react2.default.createElement(
      'select',
      { value: this.props.month, className: 'react-datepicker__month-select', onChange: function onChange(e) {
          return _this.onChange(e.target.value);
        } },
      this.renderSelectOptions(monthNames)
    );
  },
  renderReadView: function renderReadView(visible, monthNames) {
    return _react2.default.createElement(
      'div',
      { key: 'read', style: { visibility: visible ? 'visible' : 'hidden' }, className: 'react-datepicker__month-read-view', onClick: this.toggleDropdown },
      _react2.default.createElement(
        'span',
        { className: 'react-datepicker__month-read-view--selected-month' },
        monthNames[this.props.month]
      ),
      _react2.default.createElement('span', { className: 'react-datepicker__month-read-view--down-arrow' })
    );
  },
  renderDropdown: function renderDropdown(monthNames) {
    return _react2.default.createElement(WrappedMonthDropdownOptions, {
      key: 'dropdown',
      ref: 'options',
      month: this.props.month,
      monthNames: monthNames,
      onChange: this.onChange,
      onCancel: this.toggleDropdown });
  },
  renderScrollMode: function renderScrollMode(monthNames) {
    var dropdownVisible = this.state.dropdownVisible;

    var result = [this.renderReadView(!dropdownVisible, monthNames)];
    if (dropdownVisible) {
      result.unshift(this.renderDropdown(monthNames));
    }
    return result;
  },
  onChange: function onChange(month) {
    this.toggleDropdown();
    if (month !== this.props.month) {
      this.props.onChange(month);
    }
  },
  toggleDropdown: function toggleDropdown() {
    this.setState({
      dropdownVisible: !this.state.dropdownVisible
    });
  },
  render: function render() {
    var localeData = _moment2.default.localeData(this.props.locale);
    var monthNames = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (M) {
      return localeData.months((0, _moment2.default)({ M: M }));
    });

    var renderedDropdown = void 0;
    switch (this.props.dropdownMode) {
      case 'scroll':
        renderedDropdown = this.renderScrollMode(monthNames);
        break;
      case 'select':
        renderedDropdown = this.renderSelectMode(monthNames);
        break;
    }

    return _react2.default.createElement(
      'div',
      {
        className: 'react-datepicker__month-dropdown-container react-datepicker__month-dropdown-container--' + this.props.dropdownMode },
      renderedDropdown
    );
  }
});

module.exports = MonthDropdown;
