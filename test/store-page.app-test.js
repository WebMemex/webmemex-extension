/* eslint-env jest */
/* eslint import/namespace: "off" */

import { reidentifyOrStorePage } from 'src/page-storage/store-page'
import { dataURLToBlob } from 'blob-util'
import * as webextensionRPC from 'src/util/webextensionRPC'
import db from 'src/pouchdb'

const imageDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNiAAAABgADNjd8qAAAAABJRU5ErkJggg=='

jest.mock('src/util/tab-events')

browser.tabs = {
    get: jest.fn().mockReturnValue({
        windowId: 1,
        favIconUrl: 'https://example.com/icon.ico',
    }),
    captureVisibleTab: jest.fn().mockReturnValue(imageDataUri),
}

const removeDynamicFields = (page) => {
    delete page.page._id
    delete page.page._rev
}

beforeEach(() => {
    const freezeDry = jest.fn().mockReturnValue(
        new Promise((resolve, reject) => {
            resolve('<html></html>')
        })
    )
    const extractPageContent = jest.fn().mockReturnValue(
        new Promise((resolve, reject) => {
            resolve('page content')
        })
    )
    webextensionRPC.remoteFunction = jest.fn().mockReturnValueOnce(extractPageContent).mockReturnValueOnce(freezeDry)
})

afterAll(async () => {
    await db.destroy()
})

describe('App tests', () => {
    const tabId = 1
    const url = 'https://example.com/page'
    let favIcon

    beforeAll(async () => {
        favIcon = await dataURLToBlob(imageDataUri)
    })

    test('should return a page stub and finalPage when no similar page is in the database', async () => {
        fetch.mockResponse(favIcon)
        let expectedId = expect.stringMatching('^page/[0-9]{13}/[0-9]{10}$')
        const { page, finalPagePromise } = await reidentifyOrStorePage({tabId, url})
        const finalPage = await finalPagePromise
        expect(page.url).toBe('https://example.com/page')
        expect(page._id).toEqual(expectedId)
        removeDynamicFields(finalPage)
        expect(finalPage).toMatchSnapshot()
    })

    test('should return a page stub and finalPage when a similar page is in the database', async () => {
        fetch.mockResponse(favIcon)
        let expectedId = expect.stringMatching('^page/[0-9]{13}/[0-9]{10}$')
        const { page, finalPagePromise } = await reidentifyOrStorePage({tabId, url})
        const finalPage = await finalPagePromise
        expect(page.url).toBe('https://example.com/page')
        expect(page._id).toEqual(expectedId)
        removeDynamicFields(finalPage)
        expect(finalPage).toMatchSnapshot()
    })
})
