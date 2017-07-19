/* eslint-env jest */
/* eslint import/namespace: "off" */

import analysePage from 'src/page-analysis/background'
import db from 'src/pouchdb'
import * as tabEvents from 'src/util/tab-events'
import * as webextensionRPC from 'src/util/webextensionRPC'
import * as updateDoc from 'src/util/pouchdb-update-doc'

import * as pageAnalysis from 'src/page-analysis'
import * as getFavIcon from 'src/page-analysis/background/get-fav-icon'
import * as makeScreenshot from 'src/page-analysis/background/make-screenshot'

jest.mock('when-all-settled')

describe('analysePage', () => {
    const page = {
        _id: 'page/1234567890123/1234567890',
    }

    beforeEach(() => {
        const freezeDry = jest.fn().mockReturnValue('<html></html>')
        const extractPageContent = jest.fn().mockReturnValue(
            new Promise((resolve, reject) => {
                return 'page content'
            })
        )
        webextensionRPC.remoteFunction = jest.fn().mockReturnValueOnce(extractPageContent).mockReturnValueOnce(freezeDry)
        getFavIcon.default = jest.fn().mockReturnValue(new Promise((resolve, reject) => {
            return 'data;64,'
        }))
        makeScreenshot.default = jest.fn().mockReturnValue(new Promise((resolve, reject) => {
            return 'data;64,'
        }))
        updateDoc.default = jest.fn()
        updateDoc.setAttachment = jest.fn()
        db.get = jest.fn()
        tabEvents.whenPageDOMLoaded = jest.fn()
        pageAnalysis.revisePageFields = jest.fn()
    })

    test('should wait for the page dom to load', async () => {
        await analysePage({page, tabId: 1})
        expect(tabEvents.whenPageDOMLoaded).toBeCalledWith({tabId: 1})
    })

    test('should create remote functions for freezeDry and extractPageContent', async () => {
        expect.assertions(3)
        await analysePage({page, tabId: 1})
        expect(webextensionRPC.remoteFunction).toHaveBeenCalledTimes(2)
        expect(webextensionRPC.remoteFunction).toHaveBeenCalledWith("extractPageContent", {"tabId": 1})
        expect(webextensionRPC.remoteFunction).toHaveBeenLastCalledWith("freezeDry", {"tabId": 1})
    })

    test('should store all the attachments of the page', async () => {
        await analysePage({page, tabId: 1})
        expect(updateDoc.setAttachment).toHaveBeenCalledTimes(1)
    })

    test('should store the favicon and screenshot', async () => {
        expect.assertions(2)
        await analysePage({page, tabId: 1})
        expect(makeScreenshot.default).toHaveBeenCalledWith({tabId: 1})
        expect(getFavIcon.default).toHaveBeenCalledWith({tabId: 1})
    })

    test('should freeze dry the page and store page content', async () => {
        expect.assertions(2)
        const freezeDry = jest.fn().mockReturnValue('<html></html>')
        const extractPageContent = jest.fn().mockReturnValue(
            new Promise((resolve, reject) => {
                return 'page content'
            })
        )
        webextensionRPC.remoteFunction = jest.fn().mockReturnValueOnce(extractPageContent).mockReturnValueOnce(freezeDry)
        await analysePage({page, tabId: 1})
        expect(freezeDry).toHaveBeenCalled()
        expect(extractPageContent).toHaveBeenCalled()
    })

    test('should revise page fields with the page from the database', async () => {
        expect.assertions(2)
        await analysePage({page, tabId: 1})
        expect(db.get).toHaveBeenCalledWith(page._id)
        expect(pageAnalysis.revisePageFields).toHaveBeenCalled()
    })
})
