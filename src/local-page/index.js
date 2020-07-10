export function isStoredInternally(page) {
    return !!page._attachments?.['frozen-page.html']
}

export function isStoredInDownloads(page) {
    return !!page.download?.exists
}

export function isSnapshotAvailable(page) {
    return isStoredInternally(page) || isStoredInDownloads(page)
}

export function urlForSnapshot(page) {
    const url = urlForInternallyStoredPage(page) || urlForDownloadedPage(page)
    return url
}

export function urlForInternallyStoredPage(page) {
    if (!isStoredInternally(page)) {
        return undefined
    }
    const pageId = page._id
    const url = `/local-page.html?page=${pageId}`
    const hash = (page.url && page.url.split('#')[1])
    const href = (hash !== undefined) ? url + '#' + hash : url
    return browser.runtime.getURL(href)
}

function urlForDownloadedPage(page) {
    if (!isStoredInDownloads(page)) {
        return undefined
    }
    return `file://${page.download.filename}`
}
