/* eslint-env jest */

import { hrefForLocalPage } from 'src/page-viewer'

describe('hrefForLocalPage', () => {
    test('should return undefined for invalid page', () => {
        const page = {
            '_attachments': {
                'frozen-page.html': undefined,
            },
        }
        expect(hrefForLocalPage({page})).toBeUndefined()
    })

    test('should return an invalid url for undefined pages', () => {
        const page = {
            'url': 'https://example.com/page',
            '_attachments': {
                'frozen-page.html': new Blob(),
            },
        }
        expect(hrefForLocalPage({page})).toBe('/page-viewer/localpage.html?page=undefined')
    })

    test('should return href for local page', () => {
        const page = {
            '_id': 'page/1234567890123/1234567890',
            'url': 'https://example.com/page',
            '_attachments': {
                'frozen-page.html': new Blob(),
            },
        }
        expect(hrefForLocalPage({page})).toBe('/page-viewer/localpage.html?page=page%2F1234567890123%2F1234567890')
    })

    test('should append in page urls', () => {
        const page = {
            '_id': 'page/1234567890123/1234567890',
            'url': 'https://example.com/page#home',
            '_attachments': {
                'frozen-page.html': new Blob(),
            },
        }
        expect(hrefForLocalPage({page})).toBe('/page-viewer/localpage.html?page=page%2F1234567890123%2F1234567890#home')
    })
})
