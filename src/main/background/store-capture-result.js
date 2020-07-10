import { createPage, makeFilename, downloadBlob } from 'src/local-storage'
import { getSettings } from '../../options'

export async function storeCaptureResult(captureResult) {
    const { storeInDownloadFolder, storeInternally } = await getSettings()

    if (!storeInDownloadFolder && !storeInternally) {
        const errorMessage = `No storage location is configured. `
            + `Please choose a storage location in this extension’s preferences.`
        throw new Error(errorMessage)
    }

    const downloadItem = storeInDownloadFolder ? await downloadCaptureResult(captureResult) : undefined

    let page
    if (storeInternally) {
        // Store as a new page doc in the database.
        try {
            page = await createPage(captureResult, downloadItem)
        } catch (err) {
            const errorMessage = `The snapshot has been made, but it could not be stored in this `
                + `extension’s storage. Just saving it among your downloads instead..`
            // As a workaround, fall back to downloading the page directly (if not done already).
            if (!storeInDownloadFolder) {
                await downloadCaptureResult(captureResult)
            }
            throw new Error(errorMessage)
        }
    } else {
        // Store all except the page itself in the extension’s database.
        page = await createPage({ ...captureResult, frozenPage: undefined }, downloadItem)
    }

    return { page }
}

async function downloadCaptureResult(captureResult) {
    return await downloadBlob({
        blob: captureResult.frozenPage,
        filename: makeFilename({
            title: (captureResult.pageContent && captureResult.pageContent.title) || 'snapshot',
            timestamp: Date.now(),
        }),
    })
}
