/* eslint-env jest */
/* eslint import/namespace: "off" */

import { refreshSearchResultsUponQueryChange } from 'src/overview/epics'
import * as actions from 'src/overview/actions'
import { ActionsObservable } from 'redux-observable'

describe('refreshSearchResultsUponQueryChange', async () => {
    test('should call updateSearch when setQuery action is fired', () => {
        actions.updateSearch = jest.fn()
        const action$ = ActionsObservable.of({
            type: actions.setQuery.getType(), payload: 'test',
        })
        refreshSearchResultsUponQueryChange(action$).subscribe()
        expect(actions.updateSearch).toHaveBeenCalled()
    })

    test('should call updateSearch when setStartDate action is fired', () => {
        actions.updateSearch = jest.fn()
        const action$ = ActionsObservable.of({
            type: actions.setStartDate.getType(), payload: 1499484100658,
        })
        refreshSearchResultsUponQueryChange(action$).subscribe()
        expect(actions.updateSearch).toHaveBeenCalled()
    })

    test('should call updateSearch when setEndDate action is fired', () => {
        actions.updateSearch = jest.fn()
        const action$ = ActionsObservable.of({
            type: actions.setEndDate.getType(), payload: 1499484100658,
        })
        refreshSearchResultsUponQueryChange(action$).subscribe()
        expect(actions.updateSearch).toHaveBeenCalled()
    })

    test('should not call updateSearch when any other action is fired', () => {
        actions.updateSearch = jest.fn()
        const action$ = ActionsObservable.of({
            type: actions.hideVisit.getType(), payload: 'visit/1234567890123/1234567890',
        })
        refreshSearchResultsUponQueryChange(action$).subscribe()
        expect(actions.updateSearch).not.toHaveBeenCalled()
    })
})
