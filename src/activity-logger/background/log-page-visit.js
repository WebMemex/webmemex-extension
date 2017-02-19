import { whenPageDOMLoaded } from '../../util/tab-events'
import db from '../../pouchdb'
import { findPagesByUrl } from '../../search/find-pages'
import performPageAnalysis from '../../page-analysis/background'
import { generateVisitDocId, generatePageDocId, convertPageDocId } from '..'


// The time we expect a given URL to return the same page.
function estimatedPageLifetime({page}) {
    // For now, we assume we need not analyse any page again within one day.
    // TODO use simple heuristics to differentiate between cool and hot URLs.
    return 1000*60*60*24
}

// Decide whether we can consider the newly visited page to be the same as a
// known page we got from the same URL earlier.
function isProbablyStillTheSamePage(newPage, knownPage) {
    // Check HTTP ETag, if present: they were invented for this purpose.
    // TODO intercept the page headers to get the ETag, to make this work.
    if (newPage.ETag && newPage.ETag === knownPage.ETag) {
        return true
    }

    // Look if the known page is recent enough to trust it to still be the same.
    // TODO Be more cautious. Rely on retrospective deduplication instead.
    const timestamp = page => convertPageDocId(page._id).timestamp
    const timeDifference = timestamp(newPage) - timestamp(knownPage)
    if (0 <= timeDifference
          && timeDifference < estimatedPageLifetime({page: knownPage})
    ) {
        // We just take the bet that it still the same page.
        return true
    }

    // Not enough confidence to tell in advance that the page is still the same.
    return false
}

// Look if we can reuse an existing page instead of creating a new one.
function checkIfKnownPage({page}) {
    // Find candidates: every page with the same URL
    return findPagesByUrl({url: page.url}).then(result => {
        const canditates = result.rows.map(row => row.doc)
        // Check if any of them can be considered the same page
        const matches = canditates.filter(
            candidate => isProbablyStillTheSamePage(page, candidate)
        )
        if (matches.length > 0) {
            return matches[0]
            // ...and if more than one match?
        }
        else {
            return undefined
        }
    })
}

function createPageStub({url, timestamp}) {
    // Choose the identifier for the page itself.
    const pageId = generatePageDocId({timestamp})

    return {
        _id: pageId,
        url,
    }
}

// Store the visit in PouchDB.
function storeVisit({timestamp, url, page}) {
    const visitId = generateVisitDocId({timestamp})
    const visit = {
        visitStart: new Date(timestamp).getTime(),
        url,
        page: {_id: page._id},
        _id: visitId,
    }
    return db.put(visit).then(
        () => ({visitId})
    )
}

// Run page content analysis (text extraction, etcetera)
function triggerPageAnalysis({pageId, tabId}) {
        // Wait until its DOM has loaded.
        return whenPageDOMLoaded({tabId}).then(() => {
            // Tell the page-analysis module to do its thing.
            performPageAnalysis({pageId, tabId})
        })
        // TODO retrospectively deduplicate if a revisited page was unchanged.
}

// Create a visit and a page (unless existing), for the given URL.
export default function logPageVisit({url, tabId}) {
    const timestamp = new Date()

    const pageStub = createPageStub({
        url,
        timestamp,
    })

    // Look if we already have this page in storage.
    return checkIfKnownPage({page: pageStub}).then(page => {
        if (page !== undefined) {
            // Use that existing page instead of the new stub.
            return page
        }
        else {
            // Create a new page in the database.
            return db.put(pageStub).then(
                _ => (pageStub)
            )
        }
    }).then(page => {
        // Log the visit
        return storeVisit({timestamp, url, page}).then(
            ({visitId}) => ({page, visitId})
        )
    }).then(({page, visitId}) => {
        // Start page analysis (and possibly deduplication), but don't wait for it.
        triggerPageAnalysis({pageId: page._id, tabId})
        return {pageId: page._id, visitId}
    })
}
