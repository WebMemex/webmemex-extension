/* eslint-env jest */

import delay from './delay'
jest.useFakeTimers()

describe('delay', () => {
    test('should return with the given delay', () => {
        delay(1000)
        expect(setTimeout.mock.calls.length).toBe(1)
        expect(setTimeout.mock.calls[0][1]).toBe(1000)
    })
})
