'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _year_dropdown_options = require('./year_dropdown_options');

var _year_dropdown_options2 = _interopRequireDefault(_year_dropdown_options);

var _reactOnclickoutside = require('react-onclickoutside');

var _reactOnclickoutside2 = _interopRequireDefault(_reactOnclickoutside);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WrappedYearDropdownOptions = (0, _reactOnclickoutside2.default)(_year_dropdown_options2.default);

var YearDropdown = _react2.default.createClass({
  displayName: 'YearDropdown',

  propTypes: {
    dropdownMode: _react2.default.PropTypes.oneOf(['scroll', 'select']).isRequired,
    maxDate: _react2.default.PropTypes.object,
    minDate: _react2.default.PropTypes.object,
    onChange: _react2.default.PropTypes.func.isRequired,
    scrollableYearDropdown: _react2.default.PropTypes.bool,
    year: _react2.default.PropTypes.number.isRequired
  },

  getInitialState: function getInitialState() {
    return {
      dropdownVisible: false
    };
  },
  renderSelectOptions: function renderSelectOptions() {
    var minYear = this.props.minDate ? this.props.minDate.year() : 1900;
    var maxYear = this.props.maxDate ? this.props.maxDate.year() : 2100;

    var options = [];
    for (var i = minYear; i <= maxYear; i++) {
      options.push(_react2.default.createElement(
        'option',
        { key: i, value: i },
        i
      ));
    }
    return options;
  },
  onSelectChange: function onSelectChange(e) {
    this.onChange(e.target.value);
  },
  renderSelectMode: function renderSelectMode() {
    return _react2.default.createElement(
      'select',
      {
        value: this.props.year,
        className: 'react-datepicker__year-select',
        onChange: this.onSelectChange },
      this.renderSelectOptions()
    );
  },
  renderReadView: function renderReadView(visible) {
    return _react2.default.createElement(
      'div',
      { key: 'read', style: { visibility: visible ? 'visible' : 'hidden' }, className: 'react-datepicker__year-read-view', onClick: this.toggleDropdown },
      _react2.default.createElement('span', { className: 'react-datepicker__year-read-view--down-arrow' }),
      _react2.default.createElement(
        'span',
        { className: 'react-datepicker__year-read-view--selected-year' },
        this.props.year
      )
    );
  },
  renderDropdown: function renderDropdown() {
    return _react2.default.createElement(WrappedYearDropdownOptions, {
      key: 'dropdown',
      ref: 'options',
      year: this.props.year,
      onChange: this.onChange,
      onCancel: this.toggleDropdown,
      scrollableYearDropdown: this.props.scrollableYearDropdown });
  },
  renderScrollMode: function renderScrollMode() {
    var dropdownVisible = this.state.dropdownVisible;

    var result = [this.renderReadView(!dropdownVisible)];
    if (dropdownVisible) {
      result.unshift(this.renderDropdown());
    }
    return result;
  },
  onChange: function onChange(year) {
    this.toggleDropdown();
    if (year === this.props.year) return;
    this.props.onChange(year);
  },
  toggleDropdown: function toggleDropdown() {
    this.setState({
      dropdownVisible: !this.state.dropdownVisible
    });
  },
  render: function render() {
    var renderedDropdown = void 0;
    switch (this.props.dropdownMode) {
      case 'scroll':
        renderedDropdown = this.renderScrollMode();
        break;
      case 'select':
        renderedDropdown = this.renderSelectMode();
        break;
    }

    return _react2.default.createElement(
      'div',
      {
        className: 'react-datepicker__year-dropdown-container react-datepicker__year-dropdown-container--' + this.props.dropdownMode },
      renderedDropdown
    );
  }
});

module.exports = YearDropdown;
