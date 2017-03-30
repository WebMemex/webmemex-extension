import { isWorthRemembering, generatePageDocId, generateVisitDocId,
         visitKeyPrefix, convertVisitDocId } from './activity-logger'

// Get the visitItems for each browserItem( browserItem refers to either a bookmarkItem or a historyItem).
// Returns them as an array of: {browserItem, visitItems: [visitItem, ...]}.
export function getVisitItemsForBrowserItems(browserItems) {
    // Get all visits to each of those items.
    const promises = browserItems.map(browserItem =>
        browser.history.getVisits({
            url: browserItem.url,
        }).then(
            visitItems => ({browserItem, visitItems})
        )
    )
    return Promise.all(promises)
}

export function transformToPageDoc({browserItem}) {
    const pageDoc = {
        _id: generatePageDocId({
            timestamp: browserItem.lastVisitTime,
            // We set the nonce manually, to prevent duplicating items if
            // importing multiple times (thus making importbrowser idempotent).
            nonce: `history-${browserItem.id}`,
        }),
        url: browserItem.url,
        title: browserItem.title,
    }
    return pageDoc
}

export function transformToVisitDoc({visitItem, pageDoc}) {
    return {
        _id: generateVisitDocId({
            timestamp: visitItem.visitTime,
            // We set the nonce manually, to prevent duplicating items if
            // importing multiple times (thus making importUtils idempotent).
            nonce: `history-${visitItem.visitId}`,
        }),
        visitStart: visitItem.visitTime,
        // Temporarily keep the pointer to the browser item's id numbering.
        // Will be replaced by the id of the corresponding visit in our model.
        referringVisitItemId: visitItem.referringVisitId,
        url: pageDoc.url,
        page: {
            _id: pageDoc._id,
        },
    }
}

// Convert the array of {browserItem, visitItems} pairs to our model.
// Returns two arrays: pageDocs and visitDocs.
export function convertbrowserItemToPagesAndVisits(allItems) {
    const pageDocs = []
    const visitDocs = {}
    allItems.forEach(({browserItem, visitItems}) => {
        // Map each pair to a page...
        const pageDoc = transformToPageDoc({browserItem})
        pageDocs.push(pageDoc)
        // ...and one or more visits to that page.
        visitItems.forEach(visitItem => {
            const visitDoc = transformToVisitDoc({visitItem, pageDoc})
            visitDocs[visitItem.visitId] = visitDoc
        })
    })
    // Now each new visit has an id, we can map the referrer-paths between them.
    Object.values(visitDocs).forEach(visitDoc => {
        // Take and forget the id of the visitItem in the browser's browser.
        const referringVisitItemId = visitDoc.referringVisitItemId
        delete visitDoc.referringVisitItemId
        if (referringVisitItemId && referringVisitItemId !== '0') {
            // Look up what visit this id maps to in our model.
            const referringVisitDoc = visitDocs[referringVisitItemId]
            if (referringVisitDoc) {
                const referringVisitDocId = referringVisitDoc._id
                // Add a reference to the visit document.
                visitDoc.referringVisit = {_id: referringVisitDocId}
            }
            else {
                // Apparently the referring visit is not present in the browser history/bookmarks.
                // We can just pretend that there was no referrer.
            }
        }
    })
    // Return the new docs.
    return {
        pageDocs,
        visitDocs: Object.values(visitDocs) // we can forget the old ids now
    }
}
