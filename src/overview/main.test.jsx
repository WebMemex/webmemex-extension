/* eslint-env jest */

import React from 'react'
import { Provider } from 'react-redux'
import { shallow } from 'enzyme'

import overview from 'src/overview'
import ReduxDevTools from 'src/dev/redux-devtools-component'

import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

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

describe('Development App', () => {
    test('should test against the given snapshot', () => {
        const store = setupStore()
        const component = shallow(
            <Provider store={store}>
                <div>
                    <overview.components.Overview grabFocusOnMount />
                    <ReduxDevTools />
                </div>
            </Provider>
        )
        expect(component).toMatchSnapshot()
    })
})
