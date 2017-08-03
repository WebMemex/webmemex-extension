/* eslint-env jest */

import randomString from './random-string'

describe('randomString tests', () => {
    test('should return a 10 digit random number', () => {
        let expected = expect.stringMatching('^[0-9]{10}$')
        expect(randomString()).toEqual(expected)
    })
})
