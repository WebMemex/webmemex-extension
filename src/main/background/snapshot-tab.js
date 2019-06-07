import { remoteFunction } from 'src/util/webextensionRPC'
import notify from 'src/util/notify'
import { capturePage } from 'src/page-capture/background'
import { storeCaptureResult } from './store-capture-result'
import { updateOrCreateContextMenuItem } from './menus-and-shortcuts'

async function captureAndStoreAndClose(tabId) {
    // Capture.
    const captureResult = await capturePage({ tabId, needScreenshot: false })
    // Store.
    await storeCaptureResult(captureResult)
    // Close.
    await browser.tabs.remove(tabId)
}

const tabMenuItemId = 'snapshotAndCloseTab'

async function setDefaultContextMenuItems() {
    try {
        await updateOrCreateContextMenuItem(tabMenuItemId, {
            title: 'Snapshot && close this tab',
            contexts: ['tab'],
            enabled: true,
        })
    } catch (err) {
        // Probably the browser does not support 'tab' context. Nothing we can do about that.
    }
}
setDefaultContextMenuItems()

// The handler for the menu item.
browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === tabMenuItemId) {
        try {
            await captureAndStoreAndClose(tab.id)
        } catch (err) {
            const message = `Failed to store the page.`
            console.error(message, err)
            notify({ message, iconUrl: '/assets/webmemex-48.png' })
        }
    }
})

// Firefox supports updating the menu when opened.
if (browser.contextMenus.onShown && browser.contextMenus.onHidden && browser.contextMenus.refresh) {
    // Whenever the menu is opened, customise the items to make more sense.
    browser.contextMenus.onShown.addListener(async (info, tab) => {
        // We only customise context menus that were opened on a tab
        if (!info.contexts.includes('tab')) return

        const canRunFreezeDry = remoteFunction('canRunFreezeDry', { tabId: tab.id })
        let canTakeSnapshot
        try {
            canTakeSnapshot = await canRunFreezeDry()
        } catch (err) {}

        if (!canTakeSnapshot) {
            await updateOrCreateContextMenuItem(tabMenuItemId, { enabled: false })

            // TODO we should check if the same menu is still open, as exemplified on MDN.
            await browser.contextMenus.refresh()
        }
    })

    // Restore normal settings whenever the menu is closed.
    browser.contextMenus.onHidden.addListener(async (info, tab) => {
        setDefaultContextMenuItems()
    })
}
