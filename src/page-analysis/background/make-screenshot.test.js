/* eslint-env jest */
/* eslint import/namespace: "off" */

import makeScreenshotOfTabAsap from 'src/page-analysis/background/make-screenshot'
import * as delay from 'src/util/delay'
import * as tabEvents from 'src/util/tab-events'

describe('makeScreenshotOfTabAsap tests', () => {
    beforeEach(() => {
        browser.tabs = {
            get: jest.fn().mockReturnValue({
                windowId: 1,
            }),
            captureVisibleTab: jest.fn().mockReturnValue('data:text/plain;charset=utf-8;base64,'),
        }
        tabEvents.whenTabActive = jest.fn()
        delay.default = jest.fn()
    })

    test('should call tabEvent functions', async () => {
        await makeScreenshotOfTabAsap({tabId: 1})
        expect(tabEvents.whenTabActive).toHaveBeenCalledWith({tabId: 1})
    })

    test('should call the delay function', async () => {
        await makeScreenshotOfTabAsap({tabId: 1})
        expect(delay.default).toHaveBeenCalled()
    })

    test('should return the dataUrl of the screenshot', async () => {
        const image = await makeScreenshotOfTabAsap({tabId: 1})
        expect(image).toBe('data:text/plain;charset=utf-8;base64,')
    })
})
