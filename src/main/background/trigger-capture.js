import { makeRemotelyCallable } from 'src/util/webextensionRPC'
import { analysePage } from 'src/page-analysis/background'
import { createPage } from 'src/local-storage'

// Analyses the page in the specified tab. Returns the page that has been created in the database.
async function storePage({ tabId, url }) {
    // Run analysis.
    const captureResult = await analysePage({ tabId })

    // Create a new page doc in the database.
    const page = await createPage({ url, ...captureResult })

    return { page }
}

// Store the page of the currently active tab
export async function storeActivePage() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const { url, id: tabId } = tabs[0]

    return await storePage({
        tabId,
        url,
    })
}

// Expose to be callable from browser button popup
makeRemotelyCallable({ storeActivePage })
