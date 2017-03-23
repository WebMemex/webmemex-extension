'use strict';

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _date_utils = require('./date_utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Day = _react2.default.createClass({
  displayName: 'Day',

  propTypes: {
    day: _react2.default.PropTypes.object.isRequired,
    endDate: _react2.default.PropTypes.object,
    highlightDates: _react2.default.PropTypes.array,
    inline: _react2.default.PropTypes.bool,
    month: _react2.default.PropTypes.number,
    onClick: _react2.default.PropTypes.func,
    onMouseEnter: _react2.default.PropTypes.func,
    preSelection: _react2.default.PropTypes.object,
    selected: _react2.default.PropTypes.object,
    selectingDate: _react2.default.PropTypes.object,
    selectsEnd: _react2.default.PropTypes.bool,
    selectsStart: _react2.default.PropTypes.bool,
    startDate: _react2.default.PropTypes.object,
    utcOffset: _react2.default.PropTypes.number
  },
  getDefaultProps: function getDefaultProps() {
    return {
      utcOffset: _moment2.default.utc().utcOffset()
    };
  },
  handleClick: function handleClick(event) {
    if (!this.isDisabled() && this.props.onClick) {
      this.props.onClick(event);
    }
  },
  handleMouseEnter: function handleMouseEnter(event) {
    if (!this.isDisabled() && this.props.onMouseEnter) {
      this.props.onMouseEnter(event);
    }
  },
  isSameDay: function isSameDay(other) {
    return (0, _date_utils.isSameDay)(this.props.day, other);
  },
  isKeyboardSelected: function isKeyboardSelected() {
    return !this.props.inline && !this.isSameDay(this.props.selected) && this.isSameDay(this.props.preSelection);
  },
  isDisabled: function isDisabled() {
    return (0, _date_utils.isDayDisabled)(this.props.day, this.props);
  },
  isHighlighted: function isHighlighted() {
    var _props = this.props,
        day = _props.day,
        highlightDates = _props.highlightDates;

    if (!highlightDates) return false;
    return highlightDates.some(function (testDay) {
      return (0, _date_utils.isSameDay)(day, testDay);
    });
  },
  isInRange: function isInRange() {
    var _props2 = this.props,
        day = _props2.day,
        startDate = _props2.startDate,
        endDate = _props2.endDate;

    if (!startDate || !endDate) return false;
    return (0, _date_utils.isDayInRange)(day, startDate, endDate);
  },
  isInSelectingRange: function isInSelectingRange() {
    var _props3 = this.props,
        day = _props3.day,
        selectsStart = _props3.selectsStart,
        selectsEnd = _props3.selectsEnd,
        selectingDate = _props3.selectingDate,
        startDate = _props3.startDate,
        endDate = _props3.endDate;


    if (!(selectsStart || selectsEnd) || !selectingDate || this.isDisabled()) {
      return false;
    }

    if (selectsStart && endDate && selectingDate.isSameOrBefore(endDate)) {
      return (0, _date_utils.isDayInRange)(day, selectingDate, endDate);
    }

    if (selectsEnd && startDate && selectingDate.isSameOrAfter(startDate)) {
      return (0, _date_utils.isDayInRange)(day, startDate, selectingDate);
    }

    return false;
  },
  isSelectingRangeStart: function isSelectingRangeStart() {
    if (!this.isInSelectingRange()) {
      return false;
    }

    var _props4 = this.props,
        day = _props4.day,
        selectingDate = _props4.selectingDate,
        startDate = _props4.startDate,
        selectsStart = _props4.selectsStart;


    if (selectsStart) {
      return (0, _date_utils.isSameDay)(day, selectingDate);
    } else {
      return (0, _date_utils.isSameDay)(day, startDate);
    }
  },
  isSelectingRangeEnd: function isSelectingRangeEnd() {
    if (!this.isInSelectingRange()) {
      return false;
    }

    var _props5 = this.props,
        day = _props5.day,
        selectingDate = _props5.selectingDate,
        endDate = _props5.endDate,
        selectsEnd = _props5.selectsEnd;


    if (selectsEnd) {
      return (0, _date_utils.isSameDay)(day, selectingDate);
    } else {
      return (0, _date_utils.isSameDay)(day, endDate);
    }
  },
  isRangeStart: function isRangeStart() {
    var _props6 = this.props,
        day = _props6.day,
        startDate = _props6.startDate,
        endDate = _props6.endDate;

    if (!startDate || !endDate) return false;
    return (0, _date_utils.isSameDay)(startDate, day);
  },
  isRangeEnd: function isRangeEnd() {
    var _props7 = this.props,
        day = _props7.day,
        startDate = _props7.startDate,
        endDate = _props7.endDate;

    if (!startDate || !endDate) return false;
    return (0, _date_utils.isSameDay)(endDate, day);
  },
  isWeekend: function isWeekend() {
    var weekday = this.props.day.day();
    return weekday === 0 || weekday === 6;
  },
  isOutsideMonth: function isOutsideMonth() {
    return this.props.month !== undefined && this.props.month !== this.props.day.month();
  },
  getClassNames: function getClassNames() {
    return (0, _classnames2.default)('react-datepicker__day', {
      'react-datepicker__day--disabled': this.isDisabled(),
      'react-datepicker__day--selected': this.isSameDay(this.props.selected),
      'react-datepicker__day--keyboard-selected': this.isKeyboardSelected(),
      'react-datepicker__day--highlighted': this.isHighlighted(),
      'react-datepicker__day--range-start': this.isRangeStart(),
      'react-datepicker__day--range-end': this.isRangeEnd(),
      'react-datepicker__day--in-range': this.isInRange(),
      'react-datepicker__day--in-selecting-range': this.isInSelectingRange(),
      'react-datepicker__day--selecting-range-start': this.isSelectingRangeStart(),
      'react-datepicker__day--selecting-range-end': this.isSelectingRangeEnd(),
      'react-datepicker__day--today': this.isSameDay(_moment2.default.utc().utcOffset(this.props.utcOffset)),
      'react-datepicker__day--weekend': this.isWeekend(),
      'react-datepicker__day--outside-month': this.isOutsideMonth()
    });
  },
  render: function render() {
    return _react2.default.createElement(
      'div',
      {
        className: this.getClassNames(),
        onClick: this.handleClick,
        onMouseEnter: this.handleMouseEnter,
        'aria-label': 'day-' + this.props.day.date(),
        role: 'option' },
      this.props.day.date()
    );
  }
});

module.exports = Day;
