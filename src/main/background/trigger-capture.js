import { makeRemotelyCallable } from 'webextension-rpc'
import { capturePage } from 'src/page-capture/background'
import { storeCaptureResult } from './store-capture-result'

// Capture and store the page of the currently active tab
export async function storeActivePage() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const { id: tabId } = tabs[0]

    // Grab the page in the given tab
    const captureResult = await capturePage({ tabId })

    const storageResult = await storeCaptureResult(captureResult)
    return storageResult
}

// Expose to be callable from browser button popup
makeRemotelyCallable({ storeActivePage })
