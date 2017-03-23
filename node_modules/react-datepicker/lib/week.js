'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _day = require('./day');

var _day2 = _interopRequireDefault(_day);

var _week_number = require('./week_number');

var _week_number2 = _interopRequireDefault(_week_number);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Week = _react2.default.createClass({
  displayName: 'Week',

  propTypes: {
    day: _react2.default.PropTypes.object.isRequired,
    endDate: _react2.default.PropTypes.object,
    excludeDates: _react2.default.PropTypes.array,
    filterDate: _react2.default.PropTypes.func,
    highlightDates: _react2.default.PropTypes.array,
    includeDates: _react2.default.PropTypes.array,
    inline: _react2.default.PropTypes.bool,
    maxDate: _react2.default.PropTypes.object,
    minDate: _react2.default.PropTypes.object,
    month: _react2.default.PropTypes.number,
    onDayClick: _react2.default.PropTypes.func,
    onDayMouseEnter: _react2.default.PropTypes.func,
    preSelection: _react2.default.PropTypes.object,
    selected: _react2.default.PropTypes.object,
    selectingDate: _react2.default.PropTypes.object,
    selectsEnd: _react2.default.PropTypes.bool,
    selectsStart: _react2.default.PropTypes.bool,
    showWeekNumber: _react2.default.PropTypes.bool,
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
  renderDays: function renderDays() {
    var _this = this;

    var startOfWeek = this.props.day.clone().startOf('week');
    var days = [];
    if (this.props.showWeekNumber) {
      days.push(_react2.default.createElement(_week_number2.default, { key: 'W', weekNumber: parseInt(startOfWeek.format('w'), 10) }));
    }
    return days.concat([0, 1, 2, 3, 4, 5, 6].map(function (offset) {
      var day = startOfWeek.clone().add(offset, 'days');
      return _react2.default.createElement(_day2.default, {
        key: offset,
        day: day,
        month: _this.props.month,
        onClick: _this.handleDayClick.bind(_this, day),
        onMouseEnter: _this.handleDayMouseEnter.bind(_this, day),
        minDate: _this.props.minDate,
        maxDate: _this.props.maxDate,
        excludeDates: _this.props.excludeDates,
        includeDates: _this.props.includeDates,
        inline: _this.props.inline,
        highlightDates: _this.props.highlightDates,
        selectingDate: _this.props.selectingDate,
        filterDate: _this.props.filterDate,
        preSelection: _this.props.preSelection,
        selected: _this.props.selected,
        selectsStart: _this.props.selectsStart,
        selectsEnd: _this.props.selectsEnd,
        startDate: _this.props.startDate,
        endDate: _this.props.endDate,
        utcOffset: _this.props.utcOffset });
    }));
  },
  render: function render() {
    return _react2.default.createElement(
      'div',
      { className: 'react-datepicker__week' },
      this.renderDays()
    );
  }
});

module.exports = Week;
