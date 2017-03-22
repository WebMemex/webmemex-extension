import React from 'react'
import { connect } from 'react-redux'
import DatePicker from 'react-datepicker'
import moment from 'moment';

import * as actions from '../actions'
import { ourState } from '../selectors'
import ResultList from './ResultList'
import LoadingIndicator from './LoadingIndicator'

import styles from './Overview.css'

const optionsStyle = {
  maxWidth: 255,
  marginRight: 'auto',
}; 

class Overview extends React.Component {

  
    render() {
     
           
        return <div>
<<<<<<< HEAD
               <input
                  className={styles.query}
                  onChange={e=>this.props.onInputChanged(e.target.value)}
                  placeholder="Search your memory"
                  value={this.props.query}
                  ref='inputQuery'
               >
               </input>
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
                <ResultList searchResult={this.props.searchResult} />
               </div>         
          }

     componentDidMount() {
=======
            <input
                className={styles.query}
                onChange={e=>this.props.onInputChanged(e.target.value)}
                placeholder="Search your memory"
                value={this.props.query}
                ref='inputQuery'
            >
            </input>
            {this.props.waitingForResults
                ? <LoadingIndicator />
                : <ResultList searchResult={this.props.searchResult} searchQuery={this.props.query} />
            }
        </div>
    }

    componentDidMount() {
>>>>>>> 44444645628e80587cb483186d9c3d081acc2bd0
        if (this.props.grabFocusOnMount) {
            this.refs['inputQuery'].focus()
          }
      }

  }

const mapStateToProps = (state) => ({
      query: ourState(state).query,
      searchResult: ourState(state).searchResult,
      startDate: ourState(state).startDate,
      endDate:  ourState(state).endDate
})

const mapDispatchToProps = (dispatch) => ({
      onInputChanged: input => {
         dispatch(actions.setQuery({query: input}))           
      }, 

      onStartDateChange: date => {
             dispatch(actions.handleStartChange({startDate: date}))
      },

      onEndDateChange: date => {
             dispatch(actions.handleEndChange({endDate: date}))
      },
})

export default connect(mapStateToProps, mapDispatchToProps, )(Overview)
