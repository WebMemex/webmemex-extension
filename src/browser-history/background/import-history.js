// Imports the full browser's history into our database.
// The browser's historyItems and visitItems are quite straightforwardly
// converted to pageDocs and visitDocs (sorry for the confusingly similar name).

import db from '../pouchdb'
import { updatePageSearchIndex } from '../search/find-pages'
import { getVisitItemsForBrowserItems, transformToPageDoc, transformToVisitDoc,
   convertbrowserItemToPagesAndVisits } from '../importUtils'
import { isWorthRemembering } from '../activity-logger'


// Get the historyItems (visited places/pages; not each visit to them)
function getHistoryItems({
    startTime = 0,
    endTime,
}={}) {
    return browser.history.search({
        text: '',
        maxResults: 9999999,
        startTime,
        endTime,
    }).then(historyItems =>
        historyItems.filter(({url}) => isWorthRemembering({url}))
    )
}

// Pulls the full browser history into the database.
export default function importHistory({
    startTime,
    endTime,
}={}) {
    // Get the full history: both the historyItems and visitItems.
    console.time('import history')
    return getHistoryItems({startTime, endTime}).then(
        getVisitItemsForBrowserItems
    ).then(
        // Convert everything to our data model
        convertbrowserItemToPagesAndVisits
    ).then(({pageDocs, visitDocs}) => {
        // Mark and store the pages and visits.
        let allDocs = pageDocs.concat(visitDocs)
        // Mark each doc to remember it originated from this import action.
        const importTimestamp = new Date().getTime()
        allDocs = allDocs.map(doc => ({
            ...doc,
            importedFromBrowserHistory: importTimestamp,
        }))
        // Store them into the database. Already existing docs will simply be
        // rejected, because their id (timestamp & history id) already exists.
        return db.bulkDocs(allDocs)
    }).then(() => {
        console.timeEnd('import history')
        console.time('rebuild search index')
        return updatePageSearchIndex()
    }).then(() => {
        console.timeEnd('rebuild search index')
    })
}

// Get the timestamp of the oldest visit in our database
export function getOldestVisitTimestamp() {
    return db.allDocs({startkey: visitKeyPrefix, limit: 1}).then(result => {
        return (result.rows.length > 0)
            ? convertVisitDocId(result.rows[0].id).timestamp
            : undefined
    })
}

// Get the number of importable items in the history
export function getHistoryStats() {
    return getHistoryItems().then(historyItems => ({
        quantity: historyItems.length
    }))
}
