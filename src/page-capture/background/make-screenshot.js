import { dataURLToBlob } from 'blob-util'

import delay from 'src/util/delay'
import { whenTabActive } from 'src/util/tab-events'

// Take a screenshot of the tabId, if it is active.
// Returns a promise of the screenshot (which is a Blob containing a PNG image).
// The promise rejects if the tab is not currently active!
async function snapNow({ tabId }) {
    const tab = await browser.tabs.get(tabId)
    const imageDataUrl = await browser.tabs.captureVisibleTab(
        tab.windowId,
        { format: 'png' }
    )
    const imageBlob = await dataURLToBlob(imageDataUrl)
    return imageBlob
}

// Return the promise of an image (a PNG as a Blob) of the visible area of the tab,
// but only as soon as it is active (due to a limitation of the browser API)
export default async function makeScreenshotOfTabAsap({ tabId }) {
    await whenTabActive({ tabId })
    // Some delay appears required to not fail. Perhaps the browser needs
    // to complete some rendering before the screen is captured?
    await delay(300)
    const imageBlob = await snapNow({ tabId })
    return imageBlob
}
