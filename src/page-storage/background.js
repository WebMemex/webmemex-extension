import { makeRemotelyCallable } from 'src/util/webextensionRPC'
import { storePage } from './store-page'

// Store the page of the currently active tab
export async function storeActivePage() {
    const tabs = await browser.tabs.query({active: true, currentWindow: true})
    const {url, id: tabId} = tabs[0]

    return await storePage({
        tabId,
        url,
    })
}

// Expose to be callable from browser button popup
makeRemotelyCallable({ storeActivePage })
