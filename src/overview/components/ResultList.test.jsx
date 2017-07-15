/* eslint-env jest */
/* eslint import/namespace: "off" */

import React from 'react'
import ResultList from 'src/overview/components/ResultList'
import { shallow } from 'enzyme'
import searchResult from 'src/overview/components/result.data.json'
import * as makeRangeTransform from 'src/util/make-range-transform'
import * as niceTime from 'src/util/nice-time'

describe('ResultList', () => {
    test('should test against the given snapshot when there are no results', () => {
        const bottomReachedHandler = jest.fn()
        const searchResult = {
            rows: [],
        }
        const component = shallow(
            <ResultList searchResult={searchResult} searchQuery={''} waitingForResults={false} onBottomReached={bottomReachedHandler} />
        )
        expect(component).toMatchSnapshot()
    })

    test('should test against the given snapshot when loading results', () => {
        const bottomReachedHandler = jest.fn()
        const searchResult = {
            rows: [],
        }
        const waitingForResults = true
        const component = shallow(
            <ResultList searchResult={searchResult} searchQuery={''} waitingForResults={waitingForResults} onBottomReached={bottomReachedHandler} />
        )
        expect(component).toMatchSnapshot()
    })

    test('should test against the given snapshot when search results are provided', () => {
        makeRangeTransform.makeNonlinearTransform = jest.fn().mockReturnValue(100)
        niceTime.niceDate = jest.fn().mockReturnValue('Yesterday')
        const bottomReachedHandler = jest.fn()
        const component = shallow(
            <ResultList searchResult={searchResult} searchQuery={''} waitingForResults={false} onBottomReached={bottomReachedHandler} />
        )
        expect(component).toMatchSnapshot()
    })
})
