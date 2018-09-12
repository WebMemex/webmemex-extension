import React from 'react'
import ReactDOM from 'react-dom'

import { getPage } from 'src/local-storage'
import Main from './Main'

async function render({ tab } = {}) {
    const containerElement = document.getElementById('app')

    // Get the active tab if it was not given.
    const currentTab = tab || (await browser.tabs.query({ active: true, currentWindow: true }))[0]

    // Check if we are looking at a snapshot or a live page.
    let snapshotInfo
    if (currentTab.url.startsWith(browser.runtime.getURL('/local-page.html'))) {
        const pageId = new URL(currentTab.url).searchParams.get('page')
        let page
        try {
            page = await getPage({ pageId })
        } catch (err) {
            ReactDOM.render(<b>Error: cannot get snapshot info</b>, containerElement)
            throw err
        }
        snapshotInfo = {
            originalUrl: page.url,
            timestamp: page.timestamp,
        }
    }

    ReactDOM.render(
        <Main
            tabId={currentTab.id}
            tabUrl={currentTab.url}
            snapshotInfo={snapshotInfo}
        />,
        containerElement
    )
}

async function main() {
    const { id: ourWindowId } = await browser.windows.getCurrent()

    browser.tabs.onActivated.addListener(({ tabId, windowId }) => {
        if (windowId === ourWindowId) {
            // Update our content to reflect the newly activated tab.
            render()
        }
    })

    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
        if (tab.active === true && tab.windowId === ourWindowId) {
            // Avoid a visible glitch in Firefox, which shortly shows about:blank when navigating.
            // A small downside is that now we do not update when one navigates to about:blank.
            if (tab.url === 'about:blank') return

            render({ tab }) // (passing the tab here is merely an optimisation)
        }
    })

    render()
}

main()
