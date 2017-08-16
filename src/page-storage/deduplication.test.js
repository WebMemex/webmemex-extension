/* eslint-env jest */
/* eslint import/namespace: "off" */

import tryDedupePage from 'src/page-storage/deduplication'
import * as sameness from 'src/page-storage/sameness'
import * as pouchdbUpdateDoc from 'src/util/pouchdb-update-doc'

describe('tryDedupePage', () => {
    test('should return the page if no same page candidates are present', async () => {
        const page = {
            _id: 'page/1234567890123/1234567890',
        }
        const data = await tryDedupePage({page, samePageCandidates: []})
        expect(data.page).toBe(page)
    })

    test('should call determinePageSameness', async () => {
        sameness.default = jest.fn()
        const page = {
            _id: 'page/1234567890123/1234567890',
        }
        const samePageCandidates = [{
            _id: 'page/1234567890123/1234567890',
        }, {
            _id: 'page/1234567890123/1234567890',
        }]
        await tryDedupePage({page, samePageCandidates})
        expect(sameness.default).toHaveBeenCalled()
    })

    test('should call updateDoc thrice when the pages are exactly similar', async () => {
        sameness.default = jest.fn().mockReturnValue(5)
        pouchdbUpdateDoc.default = jest.fn()
        const page = {
            _id: 'page/1234567890123/1234567890',
        }
        const samePageCandidates = [{
            _id: 'page/1234567890123/1234567890',
            protected: false,
        }, {
            _id: 'page/1234567890123/1234567890',
            protected: false,
        }]
        await tryDedupePage({page, samePageCandidates})
        expect(pouchdbUpdateDoc.default).toHaveBeenCalledTimes(3)
    })

    test('should call updateDoc once when pages are partly similar', async () => {
        sameness.default = jest.fn().mockReturnValue(2)
        pouchdbUpdateDoc.default = jest.fn()
        const page = {
            _id: 'page/1234567890123/1234567890',
        }
        const samePageCandidates = [{
            _id: 'page/1234567890123/1234567890',
            protected: false,
        }, {
            _id: 'page/1234567890123/1234567890',
            protected: false,
        }]
        await tryDedupePage({page, samePageCandidates})
        expect(pouchdbUpdateDoc.default).toHaveBeenCalledTimes(1)
    })

    test('should call updateDoc once when pages are hardly similar', async () => {
        sameness.default = jest.fn().mockReturnValue(1)
        pouchdbUpdateDoc.default = jest.fn()
        const page = {
            _id: 'page/1234567890123/1234567890',
        }
        const samePageCandidates = [{
            _id: 'page/1234567890123/1234567890',
            protected: false,
        }, {
            _id: 'page/1234567890123/1234567890',
            protected: false,
        }]
        await tryDedupePage({page, samePageCandidates})
        expect(pouchdbUpdateDoc.default).toHaveBeenCalledTimes(0)
    })
})
