/* eslint-env jest */

import updateDoc from './pouchdb-update-doc'
import db from 'src/pouchdb'

describe('updateDoc', () => {
    test('should call the database functions', async () => {
        db.put = jest.fn()
        db.get = jest.fn()
        const docId = 'page/1234567890123/1234567890'
        const updateFunc = jest.fn()
        await updateDoc(db, docId, updateFunc)
        expect(db.get).toHaveBeenCalledWith(docId)
        expect(db.put).toHaveBeenCalledTimes(1)
    })

    test('should update the doc with the updateFunc', async () => {
        const docBeforeChange = {test: 1}
        const docAfterChange = {test: 2}
        const docId = 'page/1234567890123/1234567890'
        db.put = jest.fn()
        db.get = jest.fn().mockReturnValueOnce(docBeforeChange)
        const updateFunc = jest.fn().mockReturnValueOnce(docAfterChange)
        await updateDoc(db, docId, updateFunc)
        expect(db.get).toHaveBeenCalledWith(docId)
        expect(updateFunc).toHaveBeenCalledWith(docBeforeChange)
        expect(db.put).toHaveBeenCalledWith(docAfterChange)
    })
})
