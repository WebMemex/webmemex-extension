const defaultSettings = {
    storeInDownloadFolder: true,
    storeInternally: false,
}

export async function getSettings() {
    const configuredValues = await browser.storage.local.get(Object.keys(defaultSettings))
    const effectiveValues = Object.assign({}, defaultSettings, configuredValues)
    return effectiveValues
}

export async function setSettings(settings) {
    for (const name of Object.keys(settings)) {
        if (!Object.keys(defaultSettings).includes(name)) {
            throw new Error(`Trying to set unknown setting: '${name}'.`)
        }
    }
    await browser.storage.local.set(settings)
}
