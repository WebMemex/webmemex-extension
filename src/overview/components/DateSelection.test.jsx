/* eslint-env jest */

import React from 'react'
import DateSelection from 'src/overview/components/DateSelection'
import { shallow, mount } from 'enzyme'

describe('DateSelection', () => {
    test('should test against the given snapshot', () => {
        Date.now = jest.fn()
        let date
        const dateChangeHandler = jest.fn()
        const tree = shallow(
            <DateSelection date={date} onDateChange={dateChangeHandler} />
        )
        expect(tree).toMatchSnapshot()
    })

    test('should call the onDateChange event when date is changed', () => {
        let date
        const dateChangeHandler = jest.fn()
        const tree = mount(
            <DateSelection date={date} onDateChange={dateChangeHandler} />)
        const dateInput = tree.find('input')
        dateInput.simulate('change', {target: {value: '04-03-2017'}})
        expect(dateChangeHandler).toBeCalled()
    })
})
