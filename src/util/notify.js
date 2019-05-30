const notifications = new Map()

export default async function notify({
    type = 'basic',
    iconUrl = transparent1pixelPng,
    message = '',
    title = '',
    onClicked = () => {},
    ...otherProps
} = {}) {
    const notificationId = await browser.notifications.create(
        { type, iconUrl, title, message, ...otherProps }
    )
    notifications.set(notificationId, { onClicked })

    if (!browser.notifications.onClicked.hasListener(clickedListener)) {
        browser.notifications.onClicked.addListener(clickedListener)
    }
    if (!browser.notifications.onClosed.hasListener(closedListener)) {
        browser.notifications.onClosed.addListener(closedListener)
    }
}

function clickedListener(notificationId) {
    if (notifications.has(notificationId)) {
        notifications.get(notificationId).onClicked()
    }
}

function closedListener(notificationId) {
    if (notifications.has(notificationId)) {
        notifications.delete(notificationId)
        if (notifications.size === 0) {
            browser.notifications.onClosed.removeListener(clickedListener)
            browser.notifications.onClosed.removeListener(closedListener)
        }
    }
}

const transparent1pixelPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIAAAUAAeImBZsAAAAASUVORK5CYII='
