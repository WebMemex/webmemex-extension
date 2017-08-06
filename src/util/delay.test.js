/* eslint-env jest */

import delay from './delay'
jest.useFakeTimers()

describe('delay', () => {
    test('should return with the given delay', () => {
        delay(1000)
        expect(setTimeout.mock.calls.length).toBe(1)
        expect(setTimeout.mock.calls[0][1]).toBe(1000)
    })

    test('should return a promise which resolves', () => {
        expect.assertions(2)
        let assertionFunc = jest.fn(() => {
            return expect(assertionFunc).toBeCalled()
        })
        delay(10).then(() => {
            assertionFunc()
        })
        expect(assertionFunc).not.toHaveBeenCalled()
        jest.runAllTimers()
    })
})
