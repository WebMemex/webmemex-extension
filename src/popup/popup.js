import { remoteFunction } from 'src/util/webextensionRPC'
import { hrefForLocalPage } from 'src/local-page'
import { findPagesByUrl } from 'src/search/find-pages'
import { getTimestamp } from 'src/activity-logger'
import niceTime from 'src/util/nice-time'

const logActivePageVisit = remoteFunction('logActivePageVisit')

async function showSnapshots() {
    const url = (await browser.tabs.query({active: true, currentWindow: true}))[0].url
    const pagesResult = await findPagesByUrl({url})
    const listEl = document.getElementById('snapshotList')
    const lis = pagesResult.rows.map(row => {
        const page = row.doc
        const li = document.createElement('li')
        const a = document.createElement('a')
        a.innerText = niceTime(getTimestamp(page))
        a.target = '_new'
        a.href = hrefForLocalPage({page})
        li.append(a)
        return li
    })
    while (listEl.firstChild) {
        listEl.removeChild(listEl.firstChild)
    }
    if (lis.length > 0) {
        lis.forEach(li => listEl.insertBefore(li, listEl.firstChild))
    } else {
        const li = document.createElement('li')
        li.classList.add('faint')
        li.innerText = 'None yet.'
        listEl.append(li)
    }
}
showSnapshots()

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
    await showSnapshots()
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
