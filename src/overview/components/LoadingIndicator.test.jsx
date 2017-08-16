/* eslint-env jest */

import React from 'react'
import LoadingIndicator from 'src/overview/components/LoadingIndicator'
import { shallow } from 'enzyme'

describe('LoadingIndicator', () => {
    test('should test against the given snapshot', () => {
        const tree = shallow(
            <LoadingIndicator />
        )
        expect(tree).toMatchSnapshot()
    })
})
