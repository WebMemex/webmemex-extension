import get from 'lodash/fp/get'

import { getAllPages, getPageBlob } from '.'

export async function downloadAllPages({ folder } = {}) {
    const pagesResult = await getAllPages()
    if (folder === undefined) {
        folder = `WebMemex snapshots dump ${new Date().toISOString().substring(0, 10)}`
    }
    const failedDownloads = []
    for (const i in pagesResult.rows) {
        const page = pagesResult.rows[i].doc

        // Check if it has a stored page attached at all.
        if (!get(['_attachments', 'frozen-page.html'])(page)) {
            continue
        }

        try {
            await downloadPage({ page, folder })
        } catch (error) {
            failedDownloads.push({ page, error })
        }
    }
    if (failedDownloads) {
        const errorMessages = failedDownloads.map(({ page, error }) =>
            `${page._id} ("${page.title}"): ${error.message}\n`
        )
        throw new Error(`Some downloads failed:\n${errorMessages}`)
    }
}

export async function downloadPage({ page, folder, filename, saveAs }) {
    // Read the html file from the database.
    const blob = await getPageBlob({ page })

    if (filename === undefined) {
        filename = makeFilename({
            folder,
            timestamp: page.timestamp,
            title: page.title,
        })
    }

    await downloadBlob({ blob, filename, saveAs })
}

export function makeFilename({ folder, title, timestamp }) {
    // Use title as filename, after removing (back)slashes.
    const date = new Date(timestamp).toISOString().substring(0, 10)
    let filename = `${date} - ${title.replace(/[\\/]/g, '-')}.html`
    if (folder !== undefined) {
        filename = [folder, filename].join('/')
    }
    return filename
}

export async function downloadBlob({ blob, filename, saveAs = false }) {
    const url = URL.createObjectURL(blob)

    const tryDownload = filename => browser.downloads.download({
        url,
        filename,
        saveAs,
        conflictAction: 'uniquify',
    })
    try {
        await tryDownload(filename)
    } catch (err) {
        // Possibly due to punctuation in the filename (Chromium is picky).
        if (err.message.includes('filename')) {
            filename = filename.replace(/['?:~<>*|]/g, '-') // an empirically composed list.
            await tryDownload(filename)
        }
    }
    // Forget the blob again. Firefox needs a moment; we give it 10s to be on the safe side.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000*10)
}
