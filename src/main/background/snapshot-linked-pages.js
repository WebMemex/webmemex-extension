import { parallelise, forAwait } from 'src/util/parallel-generator'
import { remoteFunction } from 'src/util/webextensionRPC'
import { capturePage } from 'src/page-capture/background'
import { autoVisitUrls } from './auto-visit'
import { storeCaptureResult } from './store-capture-result'
import { updateOrCreateContextMenuItem } from './menus-and-shortcuts'

// Visit and capture each url, while storing the results.
async function visitAndCaptureAndStore(urls) {
    // Use a few tabs in parallel to speed things up, but not so many that it bogs things down.
    const nTabs = Math.min(4, urls.length)
    const parallelAutoVisitUrls = parallelise(autoVisitUrls, nTabs)
    const urlIterator = urls[Symbol.iterator]() // a shared iterator, to not visit each URL n times.
    // Visit.
    await forAwait(parallelAutoVisitUrls(urlIterator), async ({ tabId }) => {
        // Capture.
        const captureResult = await capturePage({ tabId, needScreenshot: false })
        // Store.
        await storeCaptureResult(captureResult)
    })
}

const linkMenuItemId = 'snapshotLinkedPage'
const selectionMenuItemId = 'snapshotPagesLinkedInSelection'

// Create two new context ('right-click') menu items: one is to be shown when right-clicking a link,
// the other when right-clicking a selection.
function setDefaultContextMenuItems() {
    updateOrCreateContextMenuItem(linkMenuItemId, {
        title: 'Snapshot linked page',
        contexts: ['link'],
        visible: true,
        enabled: true,
    })

    updateOrCreateContextMenuItem(selectionMenuItemId, {
        title: 'Snapshot linked pages',
        contexts: ['selection'],
        visible: true,
        enabled: true,
    })
}
setDefaultContextMenuItems()

// The handler for both menu items.
browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === linkMenuItemId) {
        const url = info.linkUrl
        await visitAndCaptureAndStore([url])
    }

    if (info.menuItemId === selectionMenuItemId) {
        const urls = await getLinksInSelectionOfTab(tab.id)
        await visitAndCaptureAndStore(urls)
    }
})

// Firefox supports updating the menu when opened.
if (browser.contextMenus.onShown && browser.contextMenus.onHidden && browser.contextMenus.refresh) {
    // Whenever the menu is opened, customise the items to make more sense.
    browser.contextMenus.onShown.addListener(async (info, tab) => {
        // We only customise context menus that were opened on a selection
        if (!info.contexts.includes('selection')) return

        // When right-clicking on a link in a selection, avoid showing both menu items.
        if (info.contexts.includes('link')) {
            await updateOrCreateContextMenuItem(linkMenuItemId, {
                visible: false,
                enabled: false, // for browsers not supporting 'visible' (= Firefox 60..62)
            })
        }

        // Count the number of URLs in the current selection, update the menu item text accordingly.
        const urls = await getLinksInSelectionOfTab(tab.id)
        let newProperties
        if (urls.length === 0) {
            newProperties = { visible: false, enabled: false }
        } else {
            newProperties = { title: `Snapshot linked pages (${urls.length} in selection)` }
        }
        await updateOrCreateContextMenuItem(selectionMenuItemId, newProperties)

        // TODO we should check if the same menu is still open, as exemplified on MDN.
        await browser.contextMenus.refresh()
    })

    // Restore normal settings whenever the menu is closed.
    browser.contextMenus.onHidden.addListener(async (info, tab) => {
        setDefaultContextMenuItems()
    })
}

// Ask a tab for the links inside its current selection.
async function getLinksInSelectionOfTab(tabId) {
    const getLinksInSelection = remoteFunction('getLinksInSelection', { tabId })
    const urls = await getLinksInSelection()
    return urls
}
