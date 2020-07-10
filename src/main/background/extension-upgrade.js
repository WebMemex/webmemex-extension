async function onExtensionUpdated({ previousVersion }) {
    const { extensionUpdate } = await browser.storage.local.get('extensionUpdate')

    if (!extensionUpdate) {
        await browser.storage.local.set({
            extensionUpdate: {
                lastSeenVersion: previousVersion,
            },
        })
    }
}

browser.runtime.onInstalled.addListener(async ({ reason, previousVersion }) => {
    if (reason === 'updated') await onExtensionUpdated({ previousVersion })
})
