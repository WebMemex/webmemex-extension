import logPageVisit from './log-page-visit'
import { isWorthRemembering } from '..'

// Listen for navigations to log them and analyse the pages.
browser.webNavigation.onCommitted.addListener(({url, tabId, frameId}) => {
    // Ignore pages loaded in frames, it is usually noise.
    if (frameId !== 0)
        return

    if (!isWorthRemembering({url}))
        return

    logPageVisit({url, tabId})

})
