import last from 'lodash/fp/last'
import isEqual from 'lodash/fp/isEqual'
import { createAction } from 'redux-act'

import { filterPagesByQuery, deletePage as deletePageFromDb } from 'src/local-storage'
import asyncActionCreator from 'src/util/redux-async-action-creator'

import { ourState } from './selectors'


// == Simple commands to change the state in reducers ==

export const setQuery = createAction('overview/setQuery')
export const setStartDate = createAction('overview/setStartDate')
export const setEndDate = createAction('overview/setEndDate')
export const hideResult = createAction('overview/hideResult')


// == Actions that trigger other actions ==

// Initialisation
export function init() {
    return function (dispatch, getState) {
        // Perform an initial search to populate the view (empty query = get all docs)
        dispatch(newSearch())
    }
}

export function deletePage({ page }) {
    return async function (dispatch, getState) {
        // Hide the page directly (optimistically).
        dispatch(hideResult({ id: page._id }))
        // Remove it from the database.
        await deletePageFromDb({ page })
    }
}

export const newSearch = asyncActionCreator(() => async (dispatch, getState) => {
    const { currentQueryParams } = ourState(getState())
    const searchResult = await filterPagesByQuery({
        ...currentQueryParams,
        limit: 10,
        softLimit: true,
    })
    return searchResult
})

export const expandSearch = asyncActionCreator(() => async (dispatch, getState) => {
    const { currentQueryParams, searchResult } = ourState(getState())
    // Look from which item the search should continue.
    const skipUntil = searchResult.searchedUntil
        || (searchResult.rows.length && last(searchResult.rows).id)
        || undefined
    // Get the items that are to be appended.
    const newSearchResult = await filterPagesByQuery({
        ...currentQueryParams,
        skipUntil,
        limit: 10,
        softLimit: true,
    })
    return newSearchResult
})

export const updateSearch = () => (dispatch, getState) => {
    const state = ourState(getState())
    if (isEqual(state.activeQueryParams, state.currentQueryParams)) {
        // The query has not actually changed since our last search, so no need to update.
        return
    }
    // Cancel any running searches and start again.
    newSearch.cancelAll()
    expandSearch.cancelAll()
    dispatch(newSearch())
}

export const loadMoreResults = () => (dispatch, getState) => {
    // If a search is already running, don't do anything.
    if (newSearch.isPending() || expandSearch.isPending()) return
    dispatch(expandSearch())
}
