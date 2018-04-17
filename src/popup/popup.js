import { remoteFunction } from 'src/util/webextensionRPC'
import { hrefForLocalPage } from 'src/local-page'


const logActivePageVisit = remoteFunction('logActivePageVisit')

async function storeThisPage() {
    storeButton.classList.add('disabled')
    storeButton.querySelector('.icon').classList.add('loading')

    let page
    try {
        const { page: page_ } = await logActivePageVisit()
        page = page_
    } catch (err) {
        const errorMessage = document.getElementById('errorMessage')
        errorMessage.classList.remove('hidden')
        const errorMessageContent = document.getElementById('errorMessageContent')
        errorMessageContent.innerText = `Error: ${err && err.message}`
        return
    } finally {
        storeButton.classList.remove('disabled')
        storeButton.querySelector('.icon').classList.remove('loading')
    }
    const successMessage = document.getElementById('successMessage')
    successMessage.classList.remove('hidden')

    const href = hrefForLocalPage({page})
    if (href) {
        const snapshotLink = document.getElementById('snapshotLink')
        snapshotLink.setAttribute('href', href)
        snapshotLink.classList.remove('hidden')
    }
}

const storeButton = document.getElementById('storeButton')
storeButton.onclick = storeThisPage

const overviewButton = document.getElementById('overviewButton')
overviewButton.onclick = async () => {
    await browser.tabs.create({
        url: '/overview.html',
    })
    window.close()
}

const loggingEnabledCheckbox = document.getElementById('loggingEnabled')
// Load initial checkbox value from storage
// (note that we do not keep this value in sync bidirectionally; should be okay for a popup).
;(async () => {
    const { loggingEnabled } = await browser.storage.local.get('loggingEnabled')
    loggingEnabledCheckbox.checked = loggingEnabled
})()
// Update the storage when loggingEnabledCheckbox value changes.
loggingEnabledCheckbox.onchange = async () => {
    browser.storage.local.set({loggingEnabled: loggingEnabledCheckbox.checked})
}
