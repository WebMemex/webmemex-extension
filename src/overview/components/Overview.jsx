import React from 'react'
import { connect } from 'react-redux'

import * as actions from '../actions'
import { ourState } from '../selectors'
import ResultList from './ResultList'
import LoadingIndicator from './LoadingIndicator'
import DatePicker from 'react-datepicker'
import moment from 'moment';
import styles from './Overview.css'

class Overview extends React.Component {
    render() {
        return  <div>
                <div>
                <input
                  className={styles.query}
                  onChange={e=>this.props.onInputChanged(e.target.value)}
                  placeholder="Search your memory"
                  value={this.props.query}
                  ref='inputQuery'
                 >
                  </input>
                </div>
               <div>
                  <DatePicker
                    placeholderText="select startdate"
                    selected={this.props.startDate }
                    minDate={moment().subtract(365,"days")}
                    maxDate={moment()}
                    onChange={e=>this.props.onStartDateChange(e)}
                />
                  <DatePicker
                    placeholderText="select startdate"
                    selected={this.props.endDate}
                    minDate={moment().subtract(365,"days")}
                    maxDate={moment()}
                    onChange={e=>this.props.onEndDateChange(e)}
                  />
                </div>
                <div>
                <input
                  className={styles.query}
                  onChange={e=>this.props.onInputDate(e.target.value)} 
                  placeholder="natural language date parser"
                  value={this.props.nlp_date}
                  ref='inputDate'
                 >
                  </input>
                </div> 
                <div>
                {this.props.waitingForResults
                ? <LoadingIndicator />
                : <ResultList searchResult={this.props.searchResult} searchQuery={this.props.query} />
                }
                </div>
            </div>         
        
    }


    componentDidMount() {
        if (this.props.grabFocusOnMount) {
            this.refs['inputQuery'].focus()
          }
    }
}

const mapStateToProps = (state) => ({

    nlp_date: ourState(state).nlp_date,
    query: ourState(state).query,
    searchResult: ourState(state).searchResult,
    waitingForResults: ourState(state).waitingForResults,
    startDate: ourState(state).startDate,
    endDate:  ourState(state).endDate
})

const mapDispatchToProps = (dispatch) => ({
    onInputChanged: input => {
        dispatch(actions.setQuery({query: input}))
    },
    onInputDate:input_date => {
        dispatch(actions.handleInputDate({nlp_date: input_date}))
    },

    onStartDateChange: date_clicked => {
             dispatch(actions.handleStartChange({startDate: date_clicked}))
      },

    onEndDateChange: date_clicked => {
             dispatch(actions.handleEndChange({endDate: date_clicked}))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(Overview)
