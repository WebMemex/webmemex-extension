import get from 'lodash/fp/get'

export function relativeUrlForLocalPage(page) {
    // Return if it does not have a stored page attached at all.
    if (
        !get(['_attachments', 'frozen-page.html'])(page)
    ) {
        return undefined
    }
    const pageId = page._id
    const url = `/local-page.html?page=${pageId}`
    const hash = (page.url && page.url.split('#')[1])
    const href = (hash !== undefined) ? url + '#' + hash : url
    return href
}

export function absoluteUrlForLocalPage(page) {
    const href = relativeUrlForLocalPage(page)
    if (!href) return undefined
    return browser.runtime.getURL(href)
}
