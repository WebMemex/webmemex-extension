/* eslint-env jest */

import {isLoggable, generateVisitDocId, convertVisitDocId, getTimestamp, shouldBeLogged} from 'src/activity-logger'
import randomString from 'src/util/random-string'

describe('isLoggable', () => {
    test('should accept links of type https://example.com', () => {
        expect(isLoggable({url: 'https://example.com'})).toBe(true)
    })

    test('should reject links of type example.com', () => {
        expect(isLoggable({url: 'example.com'})).toBe(false)
    })

    test('should accept links of type http://example.com', () => {
        expect(isLoggable({url: 'http://example.com'})).toBe(true)
    })

    test('should reject links of new tab', () => {
        expect(isLoggable({url: 'about:blank'})).toBe(false)
    })

    test('should reject links of data urls', () => {
        expect(isLoggable({url: 'data:image/gif;base64,R0lGODlhyAAiALMDfD0QAADs='})).toBe(false)
    })
})

describe('shouldBeLogged', () => {
    test('should accept links of type https://example.com', () => {
        expect(shouldBeLogged({url: 'https://example.com'})).toBe(true)
    })

    test('should reject links of type example.com', () => {
        expect(shouldBeLogged({url: 'example.com'})).toBe(false)
    })
})

describe('generateVisitDocId', () => {
    test('should return visit docid with timestamp and nonce', () => {
        const timestamp = Date.now()
        const nonce = randomString()
        let docid = `visit/${timestamp}/${nonce}`
        expect(generateVisitDocId({timestamp, nonce})).toBe(docid)
    })

    test('should return visit docid without arguments', () => {
        let expected = expect.stringMatching('^visit/[0-9]{13}/[0-9]{10}$')
        expect(generateVisitDocId()).toEqual(expected)
    })
})

describe('getTimestamp', () => {
    test('should return the timestamp for a given doc', () => {
        const timestamp = Date.now()
        let doc = {
            _id: `visit/${timestamp}/1234567890`,
        }
        expect(getTimestamp(doc)).toEqual(timestamp)
    })
})

describe('convertPageDocId', () => {
    test('should return the visit doc containing the timestamp and nonce', () => {
        const timestamp = Date.now()
        const nonce = randomString()
        let docId = `visit/${timestamp}/${nonce}`
        expect(convertVisitDocId({timestamp, nonce})).toBe(docId)
    })
})
