import { createPage, makeFilename, downloadBlob } from 'src/local-storage'

export async function storeCaptureResult(captureResult) {
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
