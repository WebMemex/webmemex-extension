/* eslint-env jest */

import React from 'react'
import VisitAsListItem from 'src/overview/components/VisitAsListItem'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import searchResult from 'src/overview/components/result.data.json'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('VisitAsListItem', () => {
    test('should test against the given snapshot', () => {
        const store = mockStore({
            overview: {},
        })
        const component = shallow(
            <Provider store={store}>
                <VisitAsListItem doc={searchResult.rows[0].doc} compact={false} />
            </Provider>
        )
        expect(component).toMatchSnapshot()
    })
})
