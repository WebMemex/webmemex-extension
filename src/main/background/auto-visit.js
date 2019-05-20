import { whenPageLoadCompleteWithRedirections } from 'src/util/tab-events'

// Open the given URLs in a new tab, yield after loading each (to let the caller make a snapshot),
// then close the tab again.
export async function * autoVisitUrls(urls) {
    // Open a new tab
    const tab = await browser.tabs.create({ url: 'about:blank', active: false })
    const tabId = tab.id

    // Visit each page, one by one, in the same tab; while yielding for each.
    for (const url of urls) {
        await loadUrl({ tabId, url })
        yield { tabId, url }
    }

    // Close the tab
    await browser.tabs.remove(tabId)
}

async function loadUrl({ tabId, url }) {
    // Navigate to the URL.
    await browser.tabs.update(tabId, { url })

    // Let the tab load the page, and give some time to let any redirections complete.
    await whenPageLoadCompleteWithRedirections({ tabId })

    // TODO scroll down, perhaps heuristically try remove popups/banners if desired?
}
