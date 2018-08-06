import update from 'lodash/fp/update'
import remove from 'lodash/fp/remove'
import { createReducer } from 'redux-act'

import * as actions from './actions'


const defaultState = {
    // The current search result list.
    searchResult: { rows: [] },
    // The current input values.
    currentQueryParams: {
        query: '',
        startDate: undefined,
        endDate: undefined,
    },
    // The input values used in the most recent (possibly still pending) search action.
    activeQueryParams: undefined,
    waitingForResults: false,
}

function setQuery(state, query) {
    return { ...state, currentQueryParams: { ...state.currentQueryParams, query } }
}

function setStartDate(state, date) {
    return { ...state, currentQueryParams: { ...state.currentQueryParams, startDate: date } }
}

function setEndDate(state, date) {
    return { ...state, currentQueryParams: { ...state.currentQueryParams, endDate: date } }
}

function startNewSearch(state) {
    return {
        ...state,
        // Remove the currently displayed results
        searchResult: defaultState.searchResult,
        waitingForResults: true,
        activeQueryParams: { ...state.currentQueryParams },
    }
}

function startExpandSearch(state) {
    return {
        ...state,
        waitingForResults: true,
        activeQueryParams: { ...state.currentQueryParams },
    }
}

function finishNewSearch(state, { value, error, cancelled }) {
    const searchResult = value || state.searchResult
    return {
        ...state,
        searchResult,
        waitingForResults: false,
    }
}

function finishExpandSearch(state, { value: newResult, error, cancelled }) {
    // We prepend old rows to the new result, not vice versa, to keep other info
    // (esp. searchedUntil) from the new result.
    const searchResult = newResult
        ? { ...newResult, rows: state.searchResult.rows.concat(newResult.rows) }
        : state.searchResult // search failed or was cancelled; don't change the results.

    return {
        ...state,
        searchResult,
        waitingForResults: false,
    }
}

function hideResult(state, { id }) {
    return update('searchResult.rows',
        rows => remove(row => row.id === id)(rows)
    )(state)
}

export default createReducer({
    [actions.setQuery]: setQuery,
    [actions.setStartDate]: setStartDate,
    [actions.setEndDate]: setEndDate,
    [actions.newSearch.pending]: startNewSearch,
    [actions.newSearch.finished]: finishNewSearch,
    [actions.expandSearch.pending]: startExpandSearch,
    [actions.expandSearch.finished]: finishExpandSearch,
    [actions.hideResult]: hideResult,
}, defaultState)
