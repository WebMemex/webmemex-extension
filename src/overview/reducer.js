import { createReducer } from 'redux-act'
import MyClass from './components/DAte_value_store'
import * as actions from './actions'
import moment from 'moment'
 
const defaultState = {
    searchResult: {rows: []},
    query: '',
    waitingForResults: 0,
    startDate: '',
    endDate: '' }

function setQuery(state, {query}) {
    return {...state, query}
}

function setSearchResult(state, {searchResult}) {
    return {...state, searchResult}
}
 function showLoadingIndicator(state) {
    // We have to keep a counter, rather than a boolean, as it can currently
    // happen that multiple subsequent searches are running simultaneously. The
    // animation will thus hide again when all of them have completed.
    return {...state, waitingForResults: state.waitingForResults+1}
}

function hideLoadingIndicator(state) {
    return {...state, waitingForResults: state.waitingForResults-1}
}

function handleStartChange(state, {startDate}) {
    //MyClss.Global_startDate = startDate;
    return Object.assign({},state, {startDate :MyClass.Global_startDate})
}

function handleEndChange(state, {endDate}) {
    //MyClss.Global_endDate = endDate;
     return Object.assign({},state, {endDate : MyClass.Global_endDate})
}
 
export default createReducer({
    [actions.setQuery]: setQuery,
    [actions.setSearchResult]: setSearchResult,
     [actions.handleStartChange]:handleStartChange,
    [actions.handleEndChange]:handleEndChange,
    [actions.showLoadingIndicator]: showLoadingIndicator,
    [actions.hideLoadingIndicator]: hideLoadingIndicator,
 }, defaultState)
