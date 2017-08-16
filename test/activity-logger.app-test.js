/* eslint-env jest */
/* eslint import/namespace: "off" */

import { maybeLogPageVisit } from 'src/activity-logger/background/log-page-visit'
import { dataURLToBlob } from 'blob-util'
import * as webextensionRPC from 'src/util/webextensionRPC'
import db from 'src/pouchdb'
import * as activityLogger from 'src/activity-logger'

const imageDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNiAAAABgADNjd8qAAAAABJRU5ErkJggg=='

jest.mock('src/util/webextensionRPC')
jest.mock('src/util/tab-events')

browser.tabs = {
    get: jest.fn().mockReturnValue({
        windowId: 1,
        favIconUrl: 'https://example.com/icon.ico',
    }),
    captureVisibleTab: jest.fn().mockReturnValue(imageDataUri),
}
browser.storage = {
    local: {
        get: jest.fn().mockReturnValue({loggingEnabled: true,
        }),
    },
}

function removeRevisionKeys(page) {
    delete page._id
    delete page._rev
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
    activityLogger.generateVisitDocId = jest.fn().mockReturnValue('visit/1234567890123/1234567890')
})

afterAll(async () => {
    await db.destroy()
})

describe('App Test', () => {
    const tabId = 1
    const url = 'https://example.com/page'
    let favIcon
    let visit

    beforeAll(async () => {
        favIcon = await dataURLToBlob(imageDataUri)
    })

    test('should create a visit in the database', async () => {
        fetch.mockResponse(favIcon)
        await maybeLogPageVisit({tabId, url})
        visit = await db.get('visit/1234567890123/1234567890')
        expect(visit._id).toBe('visit/1234567890123/1234567890')
        expect(visit.url).toBe(url)
    })

    test('should create a page in the database for the visit', async () => {
        const page = await db.get(visit.page._id)
        removeRevisionKeys(page)
        expect(page).toMatchSnapshot()
    })
})
