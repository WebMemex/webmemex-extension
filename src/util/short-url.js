// Give a shorter (but broken) version of a URL for human consumption.

export default function shortUrl(url, maxLength = 50) {
    // Remove '/' if it is the whole path: 'http://example.org/' becomes 'http://example.org'
    try {
        const urlObj = new URL(url)
        if (url.endsWith('/') && urlObj.pathname === '/' && !urlObj.search && !urlObj.hash) {
            url = url.substring(0, url.length - 1)
        }
    } catch (err) {
        // Probably url is invalid. Not really important for human consumption, so just move on.
    }

    // Remove http:// or https://
    url = url.replace(/^https?:\/\//i, '')

    if (url.length > maxLength) { url = url.slice(0, maxLength - 3) + '...' }
    return url
}
