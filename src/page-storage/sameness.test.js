/* eslint-env jest */

import determinePageSameness from 'src/page-storage/sameness'

describe('determinePageSameness', () => {
    test('should return 5 for the exact same page', () => {
        const page1 = {
            'content': {
                'title': 'Something',
                'fullText': 'Dummy Text',
            },
            '_attachments': undefined,
            'frozen-page.html': undefined,
            'digest': undefined,
        }
        const page2 = {
            'content': {
                'title': 'Something',
                'fullText': 'Dummy Text',
            },
            '_attachments': undefined,
            'frozen-page.html': undefined,
            'digest': undefined,
        }
        expect(determinePageSameness(page1, page2)).toBe(5)
    })

    test('should return 0 for totally different pages', () => {
        const page1 = {
            'content': {
                'title': 'AAAAA',
                'fullText': 'Dummy Text',
            },
            '_attachments': undefined,
            'frozen-page.html': undefined,
            'digest': undefined,
        }
        const page2 = {
            'content': {
                'title': 'ZZZZZ',
                'fullText': 'Dummy Text',
            },
            '_attachments': undefined,
            'frozen-page.html': undefined,
            'digest': undefined,
        }
        expect(determinePageSameness(page1, page2)).toBe(0)
    })

    test('should return NaN for invalid pages', () => {
        const page1 = {
            'content': {
                'fullText': 'Dummy Text',
            },
            '_attachments': undefined,
            'frozen-page.html': undefined,
            'digest': undefined,
        }
        const page2 = {
            'content': {
                'title': 'ZZZZZ',
            },
            '_attachments': undefined,
            'frozen-page.html': undefined,
            'digest': undefined,
        }
        expect(determinePageSameness(page1, page2)).toBeNaN()
    })

    test('should return 2 for similar pages', () => {
        const page1 = {
            'content': {
                'title': 'Something',
                'fullText': 'Dummy Text',
            },
            '_attachments': undefined,
            'frozen-page.html': undefined,
            'digest': undefined,
        }
        const page2 = {
            'content': {
                'title': 'something',
                'fullText': 'dummy text',
            },
            '_attachments': undefined,
            'frozen-page.html': undefined,
            'digest': undefined,
        }
        expect(determinePageSameness(page1, page2)).toBe(2)
    })
})
