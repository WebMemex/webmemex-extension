// Get a tab's fav-icon (website logo) as a Blob
async function getFavIcon({ tabId }) {
    const tab = await browser.tabs.get(tabId)

    if (tab.favIconUrl === undefined) {
        return undefined
    }

    const response = await fetch(tab.favIconUrl)
    const blob = await response.blob()
    return blob
}

export default getFavIcon
