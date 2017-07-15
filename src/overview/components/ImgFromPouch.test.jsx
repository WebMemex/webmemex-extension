/* eslint-env jest */
/* eslint import/namespace: "off" */

import React from 'react'
import ImgFromPouch from 'src/overview/components/ImgFromPouch'
import { shallow } from 'enzyme'
import * as db from 'src/pouchdb'
import searchData from 'src/overview/components/result.data.json'

describe('ImgFromPouch', () => {
    const doc = searchData.rows[0].doc
    const dataUri = 'data:image/gif;base64,R0lGODlhEAAOALMAAOazToeHh0tLS/7LZv/0jvb29t/f3//Ub//ge8WSLf/rhf/3kdbW1mxsbP//mf///yH5BAAAAAAALAAAAAAQAA4AAARe8L1Ekyky67QZ1hLnjM5UUde0ECwLJoExKcppV0aCcGCmTIHEIUEqjgaORCMxIC6e0CcguWw6aFjsVMkkIr7g77ZKPJjPZqIyd7sJAgVGoEGv2xsBxqNgYPj/gAwXEQA7'

    test('should test against the given snapshot', async () => {
        db.getAttachmentAsDataUrl = jest.fn().mockReturnValue(new Promise((resolve, reject) => {
            resolve(dataUri)
        }))
        const tree = await shallow(
            <ImgFromPouch className='favicon' doc={doc.page} attachmentId='favIcon' />
        )
        expect(tree).toMatchSnapshot()
    })

    test('should convert blob to data uri', async () => {
        db.getAttachmentAsDataUri = jest.fn().mockReturnValue(new Promise((resolve, reject) => {
            resolve(dataUri)
        }))
        const doc = searchData.rows[0].doc
        await shallow(
            <ImgFromPouch className='favicon' doc={doc.page} attachmentId='favIcon' />
        )
        expect(db.getAttachmentAsDataUrl).toBeCalled()
    })
})
