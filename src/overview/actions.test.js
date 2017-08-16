/* eslint-env jest */
/* eslint import/namespace: "off" */

import * as actions from 'src/overview/actions'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as deletion from 'src/page-storage/deletion'
import * as search from 'src/search'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('simple actions', () => {
    test('[setQuery] should dispatch the expected action', () => {
        const expectedAction = {
            payload: 'test',
            type: '[2] overview/setQuery',
        }
        expect(actions.setQuery('test')).toEqual(expectedAction)
    })

    test('[setStartDate] should dispatch the expected action', () => {
        const expectedAction = {
            payload: 1499484100658,
            type: '[3] overview/setStartDate',
        }
        expect(actions.setStartDate(1499484100658)).toEqual(expectedAction)
    })

    test('[setEndDate] should dispatch the expected action', () => {
        const expectedAction = {
            payload: 1499484100658,
            type: '[4] overview/setEndDate',
        }
        expect(actions.setEndDate(1499484100658)).toEqual(expectedAction)
    })

    test('[startNewSearch] should dispatch the expected action', () => {
        const expectedAction = {
            payload: 'visit/1234567890123/1234567890',
            type: '[5] overview/hideVisit',
        }
        expect(actions.hideVisit('visit/1234567890123/1234567890')).toEqual(expectedAction)
    })
})

describe('actions dispatching other actions', () => {
    test('[init] should dispatch the expected action', () => {
        const store = mockStore({
            overview: {},
        })
        store.dispatch(actions.init())
        expect(store.getActions()[0].type).toBe('[6] pending')
    })

    test('[deleteVisit] should dispatch the expected action', async () => {
        expect.assertions(2)
        const expectedAction = {
            payload: {visitId: 'visit/1234567890123/1234567890'},
            type: '[5] overview/hideVisit',
        }
        deletion.deleteVisitAndPage = jest.fn()
        const store = mockStore({
            overview: {},
        })
        await store.dispatch(actions.deleteVisit({visitId: 'visit/1234567890123/1234567890'}))
        expect(store.getActions()[0].type).toBe(expectedAction.type)
        expect(deletion.deleteVisitAndPage).toHaveBeenCalledWith({visitId: 'visit/1234567890123/1234567890'})
    })

    test('[newSearch] should dispatch the expected action', async () => {
        expect.assertions(4)
        search.filterVisitsByQuery = jest.fn()
        const expectedActions = [{
            type: '[6] pending',
        }, {
            type: '[8] complete',
        }, {
            type: '[7] finished',
        },
        ]
        const store = mockStore({
            overview: {},
        })
        await store.dispatch(actions.newSearch())
        expect(search.filterVisitsByQuery).toHaveBeenCalled()
        store.getActions().map(({type}, idx) => expect(type).toBe(expectedActions[idx].type))
    })

    test('[expandSearch] should dispatch the expected action', async () => {
        expect.assertions(4)
        search.filterVisitsByQuery = jest.fn()
        const expectedActions = [{
            type: '[11] pending',
        }, {
            type: '[13] complete',
        }, {
            type: '[12] finished',
        },
        ]
        const store = mockStore({
            overview: {
                searchResult: {rows: []},
                currentQueryParams: {
                    query: 'test',
                    startDate: 1499484100658,
                    endDate: 1499484100658,
                },
            },
        })
        await store.dispatch(actions.expandSearch())
        expect(search.filterVisitsByQuery).toHaveBeenCalled()
        store.getActions().map(({type}, idx) => expect(type).toBe(expectedActions[idx].type))
    })


    test('[updateSearch] should return if there is no change in query parameters', () => {
        const store = mockStore({
            overview: {
                currentQueryParams: {
                    query: 'test',
                    startDate: 1499484100658,
                    endDate: 1499484100658,
                },
                activeQueryParams: {
                    query: 'test',
                    startDate: 1499484100658,
                    endDate: 1499484100658,
                },
            },
        })
        store.dispatch(actions.updateSearch())
        expect(store.getActions().length).toBe(0)
    })

    test('[updateSearch] should cancel an ongoing search', () => {
        expect.assertions(2)
        actions.newSearch.cancelAll = jest.fn()
        actions.expandSearch.cancelAll = jest.fn()
        const store = mockStore({
            overview: {
                currentQueryParams: {
                    query: 'test',
                    startDate: 1499484100658,
                    endDate: 1499484100658,
                },
                activeQueryParams: undefined,
            },
        })
        store.dispatch(actions.updateSearch())
        expect(actions.newSearch.cancelAll).toBeCalled()
        expect(actions.expandSearch.cancelAll).toBeCalled()
    })

    test('[updateSearch] should dispatch the expected actions', () => {
        const store = mockStore({
            overview: {
                currentQueryParams: {
                    query: 'test',
                    startDate: 1499484100658,
                    endDate: 1499484100658,
                },
                activeQueryParams: undefined,
            },
        })
        store.dispatch(actions.updateSearch())
        expect(store.getActions()[0].type).toBe('[6] pending')
    })

    test('[loadMoreResults] should return if newSearch is pending', () => {
        actions.newSearch.isPending = jest.fn().mockReturnValueOnce(true)
        const store = mockStore({
            overview: {},
        })
        store.dispatch(actions.loadMoreResults())
        expect(store.getActions().length).toBe(0)
    })

    test('[loadMoreResults] should return if expandSearch is pending', () => {
        actions.newSearch.isPending = jest.fn().mockReturnValueOnce(true)
        const store = mockStore({
            overview: {},
        })
        store.dispatch(actions.loadMoreResults())
        expect(store.getActions().length).toBe(0)
    })

    test('[loadMoreResults] should dispatch the expected actions', () => {
        const store = mockStore({
            overview: {},
        })
        store.dispatch(actions.loadMoreResults())
        expect(store.getActions()[0].type).toBe('[11] pending')
    })
})
