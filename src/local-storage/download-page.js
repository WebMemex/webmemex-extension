import { isStoredInternally } from 'src/local-page'

import { getAllPages, getPageBlob } from '.'

export async function downloadAllPages({ folder } = {}) {
    const pagesResult = await getAllPages()
    if (folder === undefined) {
        folder = `WebMemex snapshots dump ${new Date().toISOString().substring(0, 10)}`
    }
    const failedDownloads = []
    for (const i in pagesResult.rows) {
        const page = pagesResult.rows[i].doc

        if (!isStoredInternally(page)) {
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
            `${page._id} ("${page.title}"): ${error.message}\n`,
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

    if (filename && filename.length > 200) {
        // At least in Firefox on Linux, it appears a long filename (≥233 chars) can fail without throwing an error, so we cut it down already.
        const i = filename.lastIndexOf('.')
        const basename = (i !== -1) ? filename.substring(0, i) : filename
        const extension = (i !== -1) ? filename.substring(i) : ''
        filename = basename.substring(0, 199 - extension.length) + '…' + extension
    }

    const tryDownload = filename => browser.downloads.download({
        url,
        filename,
        saveAs,
        conflictAction: 'uniquify',
    })
    let downloadId
    try {
        downloadId = await tryDownload(filename)
    } catch (err) {
        if (err.message.includes('filename')) {
            // Possibly due to punctuation in the filename (Chromium is picky).
            filename = filename.replace(/['?:~<>*|]/g, '-') // an empirically composed list.
            // …or because Firefox chokes on multiple consecutive spaces.
            filename = filename.replace(/\s+/g, ' ')
            // Do a second attempt.
            downloadId = await tryDownload(filename)
        }
    }
    // Forget the blob again. Firefox needs a moment; we give it 10s to be on the safe side.
    // TODO listen to downloads.onChanged instead.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000*10)

    const [downloadItem] = await browser.downloads.search({ id: downloadId })

    return downloadItem
}
