/* eslint-env jest */
/* eslint import/namespace: "off" */

import { whenPageDOMLoaded, whenPageLoadComplete, whenTabActive } from 'src/util/tab-events'
import * as eventToPromise from 'src/util/event-to-promise'

describe('whenPageDOMLoaded', () => {
    const tabId = 1

    beforeAll(() => {
        browser.webNavigation = {
            onCommitted: jest.fn(),
        }
        eventToPromise.default = jest.fn().mockReturnValue(
            new Promise((resolve, reject) => {
                resolve()
            })
        )
    })

    test('should call the browser event to execute script and resolve promise if script executes', async () => {
        browser.tabs = {
            executeScript: jest.fn().mockReturnValue(
                new Promise((resolve, reject) => {
                    resolve()
                })
            ),
        }
        await whenPageDOMLoaded({tabId})
        expect(browser.tabs.executeScript).toHaveBeenCalledWith(tabId, {code: 'undefined', runAt: 'document_end'})
    })

    test('should reject the promise if the script is not executed', async () => {
        browser.tabs = {
            executeScript: jest.fn().mockReturnValue(
                new Promise((resolve, reject) => {
                    reject(new Error('Script unable to execute'))
                })
            ),
        }
        try {
            await whenPageDOMLoaded({tabId})
        } catch (err) {
            expect(err.toString()).toBe('Error: Script unable to execute')
        }
    })

    test('should resolve promise when DOM page is loaded', async () => {
        expect.assertions(2)
        browser.tabs = {
            executeScript: jest.fn().mockReturnValue(
                new Promise((resolve, reject) => {
                    resolve()
                })
            ),
        }
        await whenPageDOMLoaded({tabId})
        expect(browser.tabs.executeScript).toHaveBeenCalledWith(tabId, {code: 'undefined', runAt: 'document_end'})
        expect(eventToPromise.default).toHaveBeenCalled()
    })

    test('should reject the promise if tab is changed', async () => {
        browser.tabs = {
            executeScript: jest.fn().mockReturnValue(
                new Promise((resolve, reject) => {
                    resolve()
                })
            ),
        }
        eventToPromise.default = jest.fn().mockReturnValue(
            new Promise((resolve, reject) => {
                reject(new Error('Tab was changed'))
            })
        )
        try {
            await whenPageDOMLoaded({tabId})
        } catch (err) {
            expect(err.toString()).toBe('Error: Tab was changed')
        }
    })
})

describe('whenPageLoadComplete', () => {
    const tabId = 1

    beforeAll(() => {
        eventToPromise.default = jest.fn().mockReturnValue(
            new Promise((resolve, reject) => {
                resolve()
            })
        )
        browser.webNavigation = {
            onCommitted: jest.fn(),
        }
    })

    test('should return if the tab status is complete', async () => {
        expect.assertions(2)
        browser.tabs = {
            get: jest.fn().mockReturnValueOnce({
                status: 'complete',
            }),
        }
        await whenPageLoadComplete({tabId})
        expect(browser.tabs.get).toHaveBeenCalledWith(tabId)
        expect(eventToPromise.default).not.toHaveBeenCalled()
    })

    test('should return a promise which resolves', async () => {
        browser.tabs = {
            get: jest.fn().mockReturnValueOnce({
                status: 'incomplete',
            }),
        }
        await whenPageLoadComplete({tabId})
        expect(eventToPromise.default).toHaveBeenCalled()
    })

    test('should reject a promise if tab is changed', async () => {
        browser.tabs = {
            get: jest.fn().mockReturnValueOnce({
                status: 'incomplete',
            }),
        }
        eventToPromise.default = jest.fn().mockReturnValue(
            new Promise((resolve, reject) => {
                reject(new Error('Tab was changed'))
            })
        )
        try {
            await whenPageLoadComplete({tabId})
        } catch (err) {
            expect(err.toString()).toBe('Error: Tab was changed')
        }
    })
})

describe('whenTabActive', () => {
    const tabId = 1

    beforeAll(() => {
        eventToPromise.default = jest.fn().mockReturnValue(
            new Promise((resolve, reject) => {
                resolve()
            })
        )
        browser.webNavigation = {
            onCommitted: jest.fn(),
        }
    })

    test('should return if the tab is active', async () => {
        expect.assertions(2)
        browser.tabs = {
            query: jest.fn().mockReturnValueOnce([{id: 1}]),
        }
        await whenTabActive({tabId})
        expect(browser.tabs.query).toHaveBeenCalledWith({active: true})
        expect(eventToPromise.default).not.toHaveBeenCalled()
    })

    test('should return a promise which resolves', async () => {
        browser.tabs = {
            query: jest.fn().mockReturnValueOnce([]),
        }
        await whenTabActive({tabId})
        expect(eventToPromise.default).toHaveBeenCalled()
    })

    test('should reject the promise if the tab is changed', async () => {
        browser.tabs = {
            query: jest.fn().mockReturnValueOnce([]),
        }
        eventToPromise.default = jest.fn().mockReturnValue(
            new Promise((resolve, reject) => {
                reject(new Error('Tab was changed'))
            })
        )
        try {
            await whenTabActive({tabId})
        } catch (err) {
            expect(err.toString()).toBe('Error: Tab was changed')
        }
    })
})
