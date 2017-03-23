'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _date_utils = require('./date_utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var DateInput = _react2.default.createClass({
  displayName: 'DateInput',

  propTypes: {
    customInput: _react2.default.PropTypes.element,
    date: _react2.default.PropTypes.object,
    dateFormat: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.array]),
    disabled: _react2.default.PropTypes.bool,
    excludeDates: _react2.default.PropTypes.array,
    filterDate: _react2.default.PropTypes.func,
    includeDates: _react2.default.PropTypes.array,
    locale: _react2.default.PropTypes.string,
    maxDate: _react2.default.PropTypes.object,
    minDate: _react2.default.PropTypes.object,
    onBlur: _react2.default.PropTypes.func,
    onChange: _react2.default.PropTypes.func,
    onChangeRaw: _react2.default.PropTypes.func,
    onChangeDate: _react2.default.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      dateFormat: 'L'
    };
  },
  getInitialState: function getInitialState() {
    return {
      value: this.safeDateFormat(this.props)
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    if (!(0, _date_utils.isSameDay)(newProps.date, this.props.date) || !(0, _date_utils.isSameUtcOffset)(newProps.date, this.props.date) || newProps.locale !== this.props.locale || newProps.dateFormat !== this.props.dateFormat) {
      this.setState({
        value: this.safeDateFormat(newProps)
      });
    }
  },
  handleChange: function handleChange(event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
    if (this.props.onChangeRaw) {
      this.props.onChangeRaw(event);
    }
    if (!event.defaultPrevented) {
      this.handleChangeDate(event.target.value);
    }
  },
  handleChangeDate: function handleChangeDate(value) {
    if (this.props.onChangeDate) {
      var date = (0, _moment2.default)(value.trim(), this.props.dateFormat, this.props.locale || _moment2.default.locale(), true);
      if (date.isValid() && !(0, _date_utils.isDayDisabled)(date, this.props)) {
        this.props.onChangeDate(date);
      } else if (value === '') {
        this.props.onChangeDate(null);
      }
    }
    this.setState({ value: value });
  },
  safeDateFormat: function safeDateFormat(props) {
    return props.date && props.date.clone().locale(props.locale || _moment2.default.locale()).format(Array.isArray(props.dateFormat) ? props.dateFormat[0] : props.dateFormat) || '';
  },
  handleBlur: function handleBlur(event) {
    this.setState({
      value: this.safeDateFormat(this.props)
    });
    if (this.props.onBlur) {
      this.props.onBlur(event);
    }
  },
  focus: function focus() {
    this.refs.input.focus();
  },
  render: function render() {
    var _props = this.props,
        customInput = _props.customInput,
        date = _props.date,
        locale = _props.locale,
        minDate = _props.minDate,
        maxDate = _props.maxDate,
        excludeDates = _props.excludeDates,
        includeDates = _props.includeDates,
        filterDate = _props.filterDate,
        dateFormat = _props.dateFormat,
        onChangeDate = _props.onChangeDate,
        onChangeRaw = _props.onChangeRaw,
        rest = _objectWithoutProperties(_props, ['customInput', 'date', 'locale', 'minDate', 'maxDate', 'excludeDates', 'includeDates', 'filterDate', 'dateFormat', 'onChangeDate', 'onChangeRaw']); // eslint-disable-line no-unused-vars

    if (customInput) {
      return _react2.default.cloneElement(customInput, _extends({}, rest, {
        ref: 'input',
        value: this.state.value,
        onBlur: this.handleBlur,
        onChange: this.handleChange
      }));
    } else {
      return _react2.default.createElement('input', _extends({
        ref: 'input',
        type: 'text'
      }, rest, {
        value: this.state.value,
        onBlur: this.handleBlur,
        onChange: this.handleChange }));
    }
  }
});

module.exports = DateInput;
