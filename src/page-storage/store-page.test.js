/* eslint-env jest */
/* eslint import/namespace: "off" */

import { reidentifyOrStorePage } from 'src/page-storage/store-page'
import db from 'src/pouchdb'
import * as findPages from 'src/search/find-pages'
import * as pageAnalysis from 'src/page-analysis/background'
import * as deduplication from 'src/page-storage/deduplication'
import * as pageStorage from 'src/page-storage/index'

describe('reidentifyOrStorePage', () => {
    beforeAll(() => {
        pageStorage.generatePageDocId = jest.fn()
        db.put = jest.fn()
        pageAnalysis.default = jest.fn().mockReturnValue({
            analysedPage: {},
        })
        deduplication.default = jest.fn().mockReturnValue({
            finalPage: {},
        })
        findPages.findPagesByUrl = jest.fn(() => {
            return {
                rows: [{
                    doc: 'page/1234567890123/1234567890',
                }, {
                    doc: 'page/1234567890123/1234567890',
                },
                ],
            }
        })
    })

    test('should find pages by url', async () => {
        await reidentifyOrStorePage({tabId: 1, url: 'https://example.com'})
        expect(findPages.findPagesByUrl).toHaveBeenCalledWith({url: 'https://example.com'})
    })

    test('should create a page stub in database', async () => {
        expect.assertions(2)
        await reidentifyOrStorePage({tabId: 1, url: 'https://example.com'})
        expect(db.put).toHaveBeenCalled()
        expect(pageStorage.generatePageDocId).toHaveBeenCalled()
    })

    test('should try and analyse page', async () => {
        await reidentifyOrStorePage({tabId: 1, url: 'https://example.com'})
        expect(pageAnalysis.default).toHaveBeenCalled()
    })
})
