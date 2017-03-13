import React from 'react'
import { connect } from 'react-redux'
import * as actions from '../actions'
import { ourState } from '../selectors'
import ResultList from './ResultList'
import styles from './Overview.css'
import { Calendar } from  'react-date-range'
import DatePicker from 'react-datepicker'
import moment from 'moment';
import Myclass from './DAte_value_store';  

const optionsStyle = {
  maxWidth: 255,
  marginRight: 'auto',
}; 

class Overview extends React.Component {

  
    render() {
     
           const { date, onChange } = this.props;
        return (
      <div>

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
                    selected={this.props.current_Start_date }
                    minDate={moment().subtract(365,"days")}
                    maxDate={moment()}
                    onChange={e=>this.props.onStartDateChange(e)}
    
                  />
                  <DatePicker
                    placeholderText="select startdate"
                    selected={this.props.current_End_date}
                    minDate={moment().subtract(365,"days")}
                    maxDate={moment()}
                    onChange={e=>this.props.onEndDateChange(e)}
                
                  />
                    </div>

                 
                <ResultList searchResult={this.props.searchResult} />
              
      </div>
    );
                                    
            
    }

     componentDidMount() {
        if (this.props.grabFocusOnMount) {
            this.refs['inputQuery'].focus()
        }
    }
    
}

const mapStateToProps = (state) => ({

      query: ourState(state).query,
      searchResult: ourState(state).searchResult,
      //intial setups of dates 
      current_Start_date: ourState(state).startDate,
      current_End_date:  ourState(state).endDate
})

const mapDispatchToProps = (dispatch) => ({
      onInputChanged: input => {
       
        dispatch(actions.setQuery({query: input}))
           
      },
  //used for updatind the selcted date.
      onStartDateChange: date => {
             Myclass.Global_startDate =date;
             dispatch(actions.handleStartChange({current_Start_date: date}))
              //console.log(date);
      },

      onEndDateChange: date => {
             Myclass.Global_endDate = date;
             dispatch(actions.handleEndChange({current_End_date: date}))
             
      },
})
export default connect(mapStateToProps, mapDispatchToProps, )(Overview)
