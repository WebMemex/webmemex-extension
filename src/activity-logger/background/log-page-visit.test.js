/* eslint-env jest */
/* eslint import/namespace: "off" */

import { maybeLogPageVisit, logPageVisit, logActivePageVisit } from 'src/activity-logger/background/log-page-visit'
import * as activityLogger from 'src/activity-logger'
import * as storePage from 'src/page-storage/store-page'
import * as tabEvents from 'src/util/tab-events'
import * as delay from 'src/util/delay'
import db from 'src/pouchdb'

jest.mock('src/util/webextensionRPC')

afterAll(async () => {
    await db.destroy()
})

describe('maybeLogPageVisit', () => {
    beforeAll(() => {
        tabEvents.whenPageLoadComplete = jest.fn()
        tabEvents.whenTabActive = jest.fn()
        delay.default = jest.fn()
        storePage.reidentifyOrStorePage = jest.fn().mockReturnValue({
            page: {},
            finalPagePromise: {},
        })
    })

    test('should return if shouldBeLogged is false', async () => {
        activityLogger.shouldBeLogged = jest.fn().mockReturnValueOnce(false)
        tabEvents.whenPageLoadComplete = jest.fn()
        await maybeLogPageVisit({tabId: 1, url: 'example.com'})
        expect(tabEvents.whenPageLoadComplete).toHaveBeenCalledTimes(0)
    })

    test('should return if logging is disabled', async () => {
        activityLogger.shouldBeLogged = jest.fn().mockReturnValue(true)
        tabEvents.whenPageLoadComplete = jest.fn()
        browser.storage = {
            local: {
                get: jest.fn().mockReturnValueOnce({
                    loggingEnabled: false,
                }),
            },
        }
        await maybeLogPageVisit({tabId: 1, url: 'example.com'})
        expect(tabEvents.whenPageLoadComplete).toHaveBeenCalledTimes(0)
    })

    test('should call the delay and tab functions and the tabEvents when logging is enabled', async () => {
        expect.assertions(3)
        activityLogger.shouldBeLogged = jest.fn().mockReturnValue(true)
        browser.storage = {
            local: {
                get: jest.fn().mockReturnValueOnce({
                    loggingEnabled: true,
                }),
            },
        }
        await maybeLogPageVisit({tabId: 1, url: 'https://example.com'})
        expect(delay.default).toHaveBeenCalled()
        expect(tabEvents.whenPageLoadComplete).toHaveBeenCalled()
        expect(tabEvents.whenTabActive).toHaveBeenCalled()
    })
})

describe('logPageVisit', () => {
    beforeAll(() => {
        activityLogger.generateVisitDocId = jest.fn().mockReturnValue('visit/1234567890123/1234567890')
        db.put = jest.fn()
        storePage.reidentifyOrStorePage = jest.fn().mockReturnValue({
            page: {
                _id: 'page/1234567890123/1234567890',
            },
            finalPagePromise: {},
        })
        Date.now = jest.fn().mockReturnValue('1234567890123')
    })

    test('should call reidentifyOrStorePage function', async () => {
        await logPageVisit({tabId: 1, url: 'https://example.com'})
        expect(storePage.reidentifyOrStorePage).toHaveBeenCalledWith({tabId: 1, url: 'https://example.com'})
    })

    test('should call the database function with the visit object', async () => {
        const visit = {
            _id: 'visit/1234567890123/1234567890',
            visitStart: '1234567890123',
            url: 'https://example.com',
            page: {_id: 'page/1234567890123/1234567890'},
        }
        await logPageVisit({tabId: 1, url: 'https://example.com'})
        expect(db.put).toHaveBeenCalledWith(visit)
    })
})

describe('logActivePageVisit', async () => {
    beforeAll(() => {
        browser.tabs = {
            query: jest.fn().mockReturnValue([{
                url: 'https://example.com/page',
                id: 1,
            }]),
        }
    })

    test('should throw an error if isLoggable is false', async () => {
        activityLogger.isLoggable = jest.fn().mockReturnValueOnce(false)
        try {
            await logActivePageVisit()
        } catch (e) {
            expect(e.toString()).toMatch('This page cannot be stored.')
        }
    })

    test('should call logPageVisit if isLoggable is true', async () => {
        storePage.reidentifyOrStorePage = jest.fn().mockReturnValue({
            page: {},
            finalPagePromise: {},
        })
        activityLogger.isLoggable = jest.fn().mockReturnValueOnce(true)
        await logActivePageVisit()
        expect(storePage.reidentifyOrStorePage).toHaveBeenCalled()
    })
})
