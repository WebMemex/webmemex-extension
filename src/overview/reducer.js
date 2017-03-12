import { createReducer } from 'redux-act'

import * as actions from './actions'
import moment from 'moment'
import MyClss from './components/DAte_value_store'
const defaultState = {
    searchResult: {rows: []},
    query: '',
    startDate: '',
    endDate: ''
}

function setQuery(state, {query}) {
    return {...state, query}
}

function setSearchResult(state, {searchResult}) {
    return {...state, searchResult}
}
function handleStartChange(state, {startDate}) {
    //MyClss.Global_startDate = startDate;
    return Object.assign({},state, {startDate :MyClss.Global_startDate})
}

function handleEndChange(state, {endDate}) {
    //MyClss.Global_endDate = endDate;
     return Object.assign({},state, {endDate : MyClss.Global_endDate})
}


export default createReducer({
    [actions.setQuery]: setQuery,
    [actions.setSearchResult]: setSearchResult,
    [actions.handleStartChange]:handleStartChange,
    [actions.handleEndChange]:handleEndChange

}, defaultState)
