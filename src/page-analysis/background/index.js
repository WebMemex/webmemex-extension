import { dataURLToBlob } from 'blob-util'
import whenAllSettled from 'when-all-settled'

import { whenPageDOMLoaded } from 'src/util/tab-events'
import { remoteFunction } from 'src/util/webextensionRPC'

import getFavIcon from './get-fav-icon'
import makeScreenshot from './make-screenshot'


// Captures and extracts stuff from the current page in the given tab.
export async function analysePage({ tabId }) {
    // Wait until its DOM has loaded, in case we got invoked before that.
    await whenPageDOMLoaded({ tabId }) // TODO: catch e.g. tab close.

    // These functions will be run in the content script in the tab.
    const extractPageContent = remoteFunction('extractPageContent', { tabId })
    const freezeDry = remoteFunction('freezeDry', { tabId })

    // Get and store the fav-icon
    const favIconP = getFavIcon({ tabId })
        .then(async dataUrl => await dataURLToBlob(dataUrl))

    // Capture a screenshot.
    const screenshotP = makeScreenshot({ tabId })
        .then(async dataUrl => await dataURLToBlob(dataUrl))

    // Extract the text and metadata
    const pageContentP = extractPageContent()

    // Freeze-dry and store the whole page
    const frozenPageP = freezeDry().then(htmlString =>
        new Blob([htmlString], { type: 'text/html;charset=UTF-8' })
    )

    // Wait until every task has either completed or failed.
    const [ favIcon, screenshot, pageContent, frozenPage ] = await whenAllSettled([
        favIconP,
        screenshotP,
        pageContentP,
        frozenPageP,
    ])

    return { favIcon, screenshot, pageContent, frozenPage }
}
