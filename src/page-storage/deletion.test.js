/* eslint-env jest */
/* eslint import/namespace: "off" */

import { deleteVisitAndPage } from 'src/page-storage/deletion'
import db from 'src/pouchdb'
import * as findVisits from 'src/search/find-visits'
import * as findPages from 'src/search/find-pages'

describe('deleteVisitAndPage', () => {
    beforeAll(() => {
        db.get = jest.fn().mockReturnValue({
            page: {
                _id: 'page/1234567890123/1234567890',
            },
        })
        db.remove = jest.fn()
        db.bulkDocs = jest.fn()
    })

    test('should call the database function', async () => {
        expect.assertions(3)
        findVisits.findVisits = jest.fn().mockReturnValue({
            rows: [],
        })
        findPages.getEquivalentPages = jest.fn().mockReturnValue({
            rows: [{
                _id: 'page/1234567890123/1234567890',
                value: {
                    rev: 'mock value',
                },
            }],
        })
        await deleteVisitAndPage({visitId: 'visit/1234567890/1234567890123'})
        expect(db.get).toHaveBeenCalledWith('visit/1234567890/1234567890123')
        expect(db.remove).toHaveBeenCalledWith({page: {_id: 'page/1234567890123/1234567890'}})
        expect(db.bulkDocs).toHaveBeenCalled()
    })

    test('should call the find functions', async () => {
        expect.assertions(2)
        findVisits.findVisits = jest.fn().mockReturnValue({
            rows: [{}],
        })
        findPages.getEquivalentPages = jest.fn()
        await deleteVisitAndPage({visitId: 'visit/1234567890/1234567890123'})
        expect(findVisits.findVisits).toHaveBeenCalled()
        expect(findPages.getEquivalentPages).toHaveBeenCalledWith({pageId: 'page/1234567890123/1234567890'})
    })
})
