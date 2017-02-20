import logPageVisit from './log-page-visit'
import { isWorthRemembering } from '..'

// Listen for navigations to log them and analyse the pages.
browser.webNavigation.onCompleted.addListener(({url, tabId, frameId}) => {
    // Ignore pages loaded in frames, it is usually noise.
    if (frameId !== 0)
        return

    if (!isWorthRemembering({url}))
        return

    // Look if we just made a visit to this page...
    checkIfExistingVisit({
        url, // ...with this URL...
        after: new Date()-1000*60*60, // ...less than an hour ago...
        limit: 10, // ...and with less than ten pages visited in between.
    }).then(visit => {
        // If not just visited already, log this visit.
        if (!visit) {
            return logPageVisit({url, tabId})
        }
    })
})

import db from '../../pouchdb'
import { convertVisitDocId, visitKeyPrefix } from '..'
function checkIfExistingVisit({url, after, limit}) {
    return db.allDocs({
        startkey: `${visitKeyPrefix}\uffff`,
        endkey: convertVisitDocId({timestamp: after}),
        descending: true,
        include_docs: true,
        limit,
    }).then(result => {
        const matches = result.rows.filter(row =>
            // Check if URL (up to fragment identifier) is the same
            row.doc.url.split('#')[0] === url.split('#')[0]
        )
        if (matches.length) {
            // Return the most recent match (presumably the only one)
            return matches[matches.length-1]
        }
        else {
            return undefined
        }
    })
}
