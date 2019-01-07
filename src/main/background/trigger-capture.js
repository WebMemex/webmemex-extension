import { makeRemotelyCallable } from 'src/util/webextensionRPC'
import { capturePage } from 'src/page-capture/background'
import { createPage, makeFilename, downloadBlob } from 'src/local-storage'

// Capture and store the page of the currently active tab
export async function storeActivePage() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const { id: tabId } = tabs[0]

    // Grab the page in the given tab
    const captureResult = await capturePage({ tabId })

    // Store as a new page doc in the database.
    try {
        const page = await createPage(captureResult)
        return { page }
    } catch (err) {
        const errorMessage = `The snapshot has been made, but it could not be stored in this `
            + `extension's storage. Saving it among your downloads instead..`
        // Workaround to download the page directly, without having stored it in our database.
        await downloadBlob({
            blob: captureResult.frozenPage,
            filename: makeFilename({
                title: (captureResult.pageContent && captureResult.pageContent.title) || 'snapshot',
                timestamp: Date.now(),
            }),
        })
        throw new Error(errorMessage)
    }
}

// Expose to be callable from browser button popup
makeRemotelyCallable({ storeActivePage })
