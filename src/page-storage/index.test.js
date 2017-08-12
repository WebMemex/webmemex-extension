/* eslint-env jest */

import {generatePageDocId} from 'src/page-storage'
import randomString from 'src/util/random-string'

describe('generatePageDocId tests', () => {
    test('should return visit docid with timestamp and nonce', () => {
        const timestamp = Date.now()
        const nonce = randomString()
        let docid = `page/${timestamp}/${nonce}`
        expect(generatePageDocId({timestamp, nonce})).toBe(docid)
    })

    test('should return visit docid without arguments', () => {
        let expected = expect.stringMatching('^page/[0-9]{13}/[0-9]{10}$')
        expect(generatePageDocId()).toEqual(expected)
    })
})
