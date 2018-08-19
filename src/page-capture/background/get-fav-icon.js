import { blobToDataURL } from 'blob-util'

// Get a tab's fav-icon (website logo) as a data URL
async function getFavIcon({ tabId }) {
    const tab = await browser.tabs.get(tabId)

    if (tab.favIconUrl === undefined) {
        return undefined
    }

    const response = await fetch(tab.favIconUrl)
    const blob = await response.blob()
    const dataUrl = await blobToDataURL(blob)
    return dataUrl
}

export default getFavIcon
