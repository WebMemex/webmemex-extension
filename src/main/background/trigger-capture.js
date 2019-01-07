import { makeRemotelyCallable } from 'src/util/webextensionRPC'
import { capturePage } from 'src/page-capture/background'
import { createPage } from 'src/local-storage'

// Capture and store the page of the currently active tab
export async function storeActivePage() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const { id: tabId } = tabs[0]

    // Grab the page in the given tab
    const captureResult = await capturePage({ tabId })

    // Store as a new page doc in the database.
    const page = await createPage(captureResult)

    return { page }
}

// Expose to be callable from browser button popup
makeRemotelyCallable({ storeActivePage })
