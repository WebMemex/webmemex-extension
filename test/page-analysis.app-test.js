/* eslint-env jest */
/* eslint import/namespace: "off" */

import analysePage from 'src/page-analysis/background'
import db from 'src/pouchdb'
import { dataURLToBlob } from 'blob-util'
import * as webextensionRPC from 'src/util/webextensionRPC'

const imageDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNiAAAABgADNjd8qAAAAABJRU5ErkJggg=='

jest.mock('src/util/tab-events')

browser.tabs = {
    get: jest.fn().mockReturnValue({
        windowId: 1,
        favIconUrl: 'https://example.com/icon.ico',
    }),
    captureVisibleTab: jest.fn().mockReturnValue(imageDataUri),
}

function removeRevisionKeys(page) {
    delete page.page._attachments._rev
    delete page.page._rev
}

afterAll(async () => {
    await db.destroy()
})

describe('App test', () => {
    const page = {
        "url": "https://example.com/page",
        "_id": "page/1499620431844/1337776782",
    }
    const tabId = 1
    let favIcon

    beforeAll(async () => {
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
        await db.put(page)
        favIcon = await dataURLToBlob(imageDataUri)
    })

    test('should test page in the database', async () => {
        fetch.mockResponse(favIcon)
        const returnedPage = await analysePage({page, tabId})
        removeRevisionKeys(returnedPage)
        expect(returnedPage).toMatchSnapshot()
    })
})
