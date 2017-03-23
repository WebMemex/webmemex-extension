'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _week = require('./week');

var _week2 = _interopRequireDefault(_week);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FIXED_HEIGHT_STANDARD_WEEK_COUNT = 6;

var Month = _react2.default.createClass({
  displayName: 'Month',

  propTypes: {
    day: _react2.default.PropTypes.object.isRequired,
    endDate: _react2.default.PropTypes.object,
    excludeDates: _react2.default.PropTypes.array,
    filterDate: _react2.default.PropTypes.func,
    fixedHeight: _react2.default.PropTypes.bool,
    highlightDates: _react2.default.PropTypes.array,
    includeDates: _react2.default.PropTypes.array,
    inline: _react2.default.PropTypes.bool,
    maxDate: _react2.default.PropTypes.object,
    minDate: _react2.default.PropTypes.object,
    onDayClick: _react2.default.PropTypes.func,
    onDayMouseEnter: _react2.default.PropTypes.func,
    onMouseLeave: _react2.default.PropTypes.func,
    peekNextMonth: _react2.default.PropTypes.bool,
    preSelection: _react2.default.PropTypes.object,
    selected: _react2.default.PropTypes.object,
    selectingDate: _react2.default.PropTypes.object,
    selectsEnd: _react2.default.PropTypes.bool,
    selectsStart: _react2.default.PropTypes.bool,
    showWeekNumbers: _react2.default.PropTypes.bool,
    startDate: _react2.default.PropTypes.object,
    utcOffset: _react2.default.PropTypes.number
  },

  handleDayClick: function handleDayClick(day, event) {
    if (this.props.onDayClick) {
      this.props.onDayClick(day, event);
    }
  },
  handleDayMouseEnter: function handleDayMouseEnter(day) {
    if (this.props.onDayMouseEnter) {
      this.props.onDayMouseEnter(day);
    }
  },
  handleMouseLeave: function handleMouseLeave() {
    if (this.props.onMouseLeave) {
      this.props.onMouseLeave();
    }
  },
  isWeekInMonth: function isWeekInMonth(startOfWeek) {
    var day = this.props.day;
    var endOfWeek = startOfWeek.clone().add(6, 'days');
    return startOfWeek.isSame(day, 'month') || endOfWeek.isSame(day, 'month');
  },
  renderWeeks: function renderWeeks() {
    var weeks = [];
    var isFixedHeight = this.props.fixedHeight;
    var currentWeekStart = this.props.day.clone().startOf('month').startOf('week');
    var i = 0;
    var breakAfterNextPush = false;

    while (true) {
      weeks.push(_react2.default.createElement(_week2.default, {
        key: i,
        day: currentWeekStart,
        month: this.props.day.month(),
        onDayClick: this.handleDayClick,
        onDayMouseEnter: this.handleDayMouseEnter,
        minDate: this.props.minDate,
        maxDate: this.props.maxDate,
        excludeDates: this.props.excludeDates,
        includeDates: this.props.includeDates,
        inline: this.props.inline,
        highlightDates: this.props.highlightDates,
        selectingDate: this.props.selectingDate,
        filterDate: this.props.filterDate,
        preSelection: this.props.preSelection,
        selected: this.props.selected,
        selectsStart: this.props.selectsStart,
        selectsEnd: this.props.selectsEnd,
        showWeekNumber: this.props.showWeekNumbers,
        startDate: this.props.startDate,
        endDate: this.props.endDate,
        utcOffset: this.props.utcOffset }));

      if (breakAfterNextPush) break;

      i++;
      currentWeekStart = currentWeekStart.clone().add(1, 'weeks');

      // If one of these conditions is true, we will either break on this week
      // or break on the next week
      var isFixedAndFinalWeek = isFixedHeight && i >= FIXED_HEIGHT_STANDARD_WEEK_COUNT;
      var isNonFixedAndOutOfMonth = !isFixedHeight && !this.isWeekInMonth(currentWeekStart);

      if (isFixedAndFinalWeek || isNonFixedAndOutOfMonth) {
        if (this.props.peekNextMonth) {
          breakAfterNextPush = true;
        } else {
          break;
        }
      }
    }

    return weeks;
  },
  getClassNames: function getClassNames() {
    var _props = this.props,
        selectingDate = _props.selectingDate,
        selectsStart = _props.selectsStart,
        selectsEnd = _props.selectsEnd;

    return (0, _classnames2.default)('react-datepicker__month', {
      'react-datepicker__month--selecting-range': selectingDate && (selectsStart || selectsEnd)
    });
  },
  render: function render() {
    return _react2.default.createElement(
      'div',
      { className: this.getClassNames(), onMouseLeave: this.handleMouseLeave, role: 'listbox' },
      this.renderWeeks()
    );
  }
});

module.exports = Month;
