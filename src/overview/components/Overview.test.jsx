/* eslint-env jest */
/* eslint import/namespace: "off" */

import React from 'react'
import Overview from 'src/overview/components/Overview'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'
import * as db from 'src/pouchdb'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

function setupStore(overrides) {
    const overview = Object.assign({
        searchResult: {rows: []},
        currentQueryParams: {
            query: '',
            startDate: undefined,
            endDate: undefined,
        },
        activeQueryParams: undefined,
        waitingForResults: false,
    }, overrides)
    return mockStore({overview})
}

describe('Overview', () => {
    beforeAll(() => {
        db.getAttachmentAsDataUri = jest.fn().mockReturnValue(
            new Promise((resolve, reject) => {
                resolve()
            })
        )
    })

    test('should test against the given snapshot', () => {
        const store = setupStore()
        const component = shallow(
            <Overview store={store} />
        )
        expect(component).toMatchSnapshot()
    })

    test('should setQuery when input is changed', () => {
        expect.assertions(2)
        const store = setupStore()
        const component = mount(
            <Provider store={store}>
                <Overview />
            </Provider>
        )
        const queryInput = component.find('.queryInputComponent').find('input')
        queryInput.simulate('change', { target: {value: 'test'} })
        expect(store.getActions()[0].type).toBe('[2] overview/setQuery')
        expect(store.getActions()[0].payload).toBe('test')
    })

    test('should clear the query when escape is pressed', () => {
        expect.assertions(2)
        const store = setupStore()
        const component = mount(
            <Provider store={store}>
                <Overview />
            </Provider>
        )
        const queryInput = component.find('.queryInputComponent').find('input')
        queryInput.simulate('focus')
        queryInput.simulate('keyDown', {key: 'Escape'})
        expect(store.getActions()[0].type).toBe('[2] overview/setQuery')
        expect(store.getActions()[0].payload).toBe('')
    })

    test('should set endDate when input is changed', () => {
        expect.assertions(2)
        let expected = expect.stringMatching('^[0-9]{13}$')
        const store = setupStore()
        const component = mount(
            <Provider store={store}>
                <Overview />
            </Provider>
        )
        const dateInput = component.find('DateSelection').find('input')
        dateInput.simulate('change', {target: {value: '02-03-2017'}})
        expect(store.getActions()[0].type).toBe('[4] overview/setEndDate')
        expect(store.getActions()[0].payload).toEqual(expected)
    })

    test('should load more results when bottom is reached', () => {
        const store = setupStore()
        const component = mount(
            <Provider store={store}>
                <Overview />
            </Provider>
        )
        component.find('ResultList').prop('onBottomReached')()
        expect(store.getActions()[0].type).toBe('[11] pending')
    })
})
