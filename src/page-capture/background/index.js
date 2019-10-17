import whenAllSettled from 'when-all-settled'

import delay from 'src/util/delay'
import { whenPageDOMLoaded } from 'src/util/tab-events'
import { remoteFunction } from 'webextension-rpc'

import getFavIcon from './get-fav-icon'
import makeScreenshot from './make-screenshot'

// Captures and extracts stuff from the current page in the given tab.
export async function capturePage({ tabId, needScreenshot = true }) {
    // Wait until its DOM has loaded, in case we got invoked before that.
    await whenPageDOMLoaded({ tabId }) // TODO: catch e.g. tab close.

    // These functions will be run in the content script in the tab.
    const extractPageContent = remoteFunction('extractPageContent', { tabId })
    const freezeDry = remoteFunction('freezeDry', { tabId })

    // Read the page's URL
    const { url } = await browser.tabs.get(tabId)

    // Get the fav-icon
    const favIconP = getFavIcon({ tabId })

    // Capture a screenshot.
    const screenshotP = makeScreenshot({ tabId })

    // Extract the text and metadata
    const pageContentP = extractPageContent()

    // Freeze-dry and store the whole page
    const frozenPageP = freezeDry().then(htmlString =>
        new Blob([htmlString], { type: 'text/html;charset=UTF-8' })
    )

    // Wait until freeze-dry has completed; throw if it fails.
    const frozenPage = await frozenPageP

    // Wait until every other task has either completed or failed.
    const [ favIcon, screenshot, pageContent ] = await whenAllSettled([
        favIconP,
        // If a screenshot is not required, we do not wait long for a chance to make one.
        needScreenshot ? screenshotP : Promise.race([screenshotP, delay(500)]),
        pageContentP,
    ])

    return { url, favIcon, screenshot, pageContent, frozenPage }
}
