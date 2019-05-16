import { makeRemotelyCallable } from 'src/util/webextensionRPC'
import { capturePage } from 'src/page-capture/background'
import { createPage, makeFilename, downloadBlob } from 'src/local-storage'

// Capture and store the page of the currently active tab
export async function storeActivePage() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const { id: tabId } = tabs[0]

    // Grab the page in the given tab
    const captureResult = await capturePage({ tabId })

    const { directDownload } = await browser.storage.local.get('directDownload')

    if (directDownload) {
        downloadCaptureResult(captureResult)
    }

    // Store as a new page doc in the database.
    try {
        const page = await createPage(captureResult)
        return { page }
    } catch (err) {
        const errorMessage = `The snapshot has been made, but it could not be stored in this `
            + `extension’s storage. Just saving it among your downloads instead..`
        // As a workaround, fall back to downloading the page directly (if not done already).
        if (!directDownload) {
            await downloadCaptureResult(captureResult)
        }
        throw new Error(errorMessage)
    }
}

async function downloadCaptureResult(captureResult) {
    await downloadBlob({
        blob: captureResult.frozenPage,
        filename: makeFilename({
            title: (captureResult.pageContent && captureResult.pageContent.title) || 'snapshot',
            timestamp: Date.now(),
        }),
    })
}

// Expose to be callable from browser button popup
makeRemotelyCallable({ storeActivePage })
