/* eslint-env jest */

import React from 'react'
import DevTools from 'src/dev/redux-devtools-component'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'

import overview from 'src/overview'
import { createStore, compose, combineReducers } from 'redux'

const reducer = combineReducers({
    overview: overview.reducer,
})

const enhancers = [DevTools.instrument()]
const enhancer = compose(...enhancers)

describe('DevTools', () => {
    test('should test against the given snapshot', () => {
        const store = createStore(
            reducer,
            undefined,
            enhancer,
        )
        const tree = renderer.create(
            <Provider store={store}>
                <DevTools />
            </Provider>
        ).toJSON()
        expect(tree).toMatchSnapshot()
    })
})
