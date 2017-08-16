/* eslint-env jest */

import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { createEpicMiddleware, combineEpics } from 'redux-observable'
import thunk from 'redux-thunk'
import * as actions from 'src/overview/actions'

import overview from 'src/overview'

const rootReducer = combineReducers({
    overview: overview.reducer,
})

const rootEpic = combineEpics(
    overview.epics.refreshSearchResultsUponQueryChange
)

const enhancers = [
    applyMiddleware(
        createEpicMiddleware(rootEpic),
        thunk
    ),
]
const enhancer = compose(...enhancers)

describe('reducer', () => {
    test('should set the query', () => {
        const store = createStore(
            rootReducer,
            {},
            enhancer,
        )
        store.dispatch(actions.setQuery('test'))
        expect(store.getState().overview.currentQueryParams.query).toBe('test')
    })

    test('should set the start date', () => {
        const store = createStore(
            rootReducer,
            {},
            enhancer,
        )
        store.dispatch(actions.setStartDate(1499484100658))
        expect(store.getState().overview.currentQueryParams.startDate).toBe(1499484100658)
    })

    test('should set the end date', () => {
        const store = createStore(
            rootReducer,
            {},
            enhancer,
        )
        store.dispatch(actions.setEndDate(1499484100658))
        expect(store.getState().overview.currentQueryParams.endDate).toBe(1499484100658)
    })

    test('should start new search', () => {
        expect.assertions(2)
        const store = createStore(
            rootReducer,
            {
                overview: {
                    searchResult: {
                        rows: [{
                            id: 'visit/1234567890123/1234567890',
                        }],
                    },
                },
            },
            enhancer,
        )
        store.dispatch(actions.newSearch.pending())
        expect(store.getState().overview.waitingForResults).toBe(true)
        expect(store.getState().overview.searchResult.rows.length).toBe(0)
    })

    test('should end new search', () => {
        expect.assertions(2)
        const store = createStore(
            rootReducer,
            enhancer,
        )
        const searchResult = {
            rows: [{
                id: 'visit/1234567890123/1234567890',
            }, {
                id: 'visit/0987654321098/0987654321',
            }],
        }
        store.dispatch(actions.newSearch.finished({value: searchResult, error: undefined, cancelled: undefined}))
        expect(store.getState().overview.waitingForResults).toBe(false)
        expect(store.getState().overview.searchResult.rows.length).toBe(2)
    })

    test('should start expand search', () => {
        const store = createStore(
            rootReducer,
            {},
            enhancer,
        )
        store.dispatch(actions.expandSearch.pending())
        expect(store.getState().overview.waitingForResults).toBe(true)
    })

    test('should end expand search', () => {
        expect.assertions(2)
        const store = createStore(
            rootReducer,
            {
                overview: {
                    searchResult: {
                        rows: [{
                            id: 'visit/6543217890123/1234567890',
                        }],
                    },
                },
            },
            enhancer,
        )
        const searchResult = {
            rows: [{
                id: 'visit/1234567890123/1234567890',
            }, {
                id: 'visit/0987654321098/0987654321',
            }],
        }
        store.dispatch(actions.expandSearch.finished({value: searchResult, error: undefined, cancelled: undefined}))
        expect(store.getState().overview.searchResult.rows.length).toBe(3)
        expect(store.getState().overview.waitingForResults).toBe(false)
    })

    test('should hide visit', () => {
        const store = createStore(
            rootReducer,
            {
                overview: {
                    searchResult: {
                        rows: [{
                            id: 'visit/1234567890123/1234567890',
                        }],
                    },
                },
            },
            enhancer,
        )
        store.dispatch(actions.hideVisit({visitId: 'visit/1234567890123/1234567890'}))
        expect(store.getState().overview.searchResult.rows.length).toBe(0)
    })
})
