import fromPairs from 'lodash/fp/fromPairs'
import update from 'lodash/fp/update'
import unionBy from 'lodash/unionBy'
import sortBy from 'lodash/fp/sortBy'
import reverse from 'lodash/fp/reverse'

import { convertVisitDocId, visitKeyPrefix, getTimestamp } from '../activity-logger'
import db, { normaliseFindResult, keyRangeForPrefix }  from '../pouchdb'
import { getPages } from './find-pages'

// Get query result indexed by doc id, as an {id: row} object.
const resultsById = result =>
    fromPairs(result.rows.map(row => [(row.id || row.doc._id), row]))

// Nest the page docs into the visit docs, and return the latter.
function insertPagesIntoVisits({visitsResult, pagesResult, presorted=false}) {
    // If pages are not already passed to us, get them and call ourselves again.
    if (pagesResult === undefined) {
        // Get the page of each visit.
        const pageIds = visitsResult.rows.map(row => row.doc.page._id)
        return getPages({pageIds}).then(pagesResult =>
            // Invoke ourselves with the found pages.
            insertPagesIntoVisits({visitsResult, pagesResult, presorted: true})
        )
    }

    if (presorted) {
        // A small optimisation if the results already match one to one.
        return update('rows', rows => rows.map(
            (row, i) => update('doc.page', ()=>pagesResult.rows[i].doc)(row)
        ))(visitsResult)
    }
    else {
        // Read each visit's doc.page._id and replace it with the specified page.
        const pagesById = resultsById(pagesResult)
        return update('rows', rows => rows.map(
            update('doc.page', page => pagesById[page._id].doc)
        ))(visitsResult)
    }
}

// Get the most recent visits, each with the visited page already nested in it.
export function getLastVisits({
    limit
}={}) {
    return db.find({
        selector: {
            // workaround for lack of startkey/endkey support
            _id: { $gte: visitKeyPrefix, $lte: `${visitKeyPrefix}\uffff`}
        },
        sort: [{_id: 'desc'}],
        limit,
    }).then(
        normaliseFindResult
    ).then(
        visitsResult => insertPagesIntoVisits({visitsResult})
    ).then(visitsResult =>
        // Find user-created links
        db.allDocs({
            include_docs: true,
            // XXX Quick hack.
            startkey: `link/${visitsResult.rows.length ? encodeURIComponent(new Date(visitsResult.rows.slice(-1)[0].doc.visitStart).toISOString()) : ''}`,
            endkey: 'link/\uffff',
            limit: 30,
        }).then(linksResult => ({
            rows: sortBy(
                row => -row.doc.visitStart || -row.doc.creationTime,
                visitsResult.rows.concat(linksResult.rows)
            )
        }))
    )
}


// Find all visits to the given pages, return them with the pages nested.
// Resulting visits are sorted by time, descending.
export function findVisitsToPages({pagesResult}) {
    const pageIds = pagesResult.rows.map(row => row.doc._id)
    return db.find({
        // Find the visits that contain the pages
        selector: {
            'page._id': {$in: pageIds},
            // workaround for lack of startkey/endkey support
            _id: {$gte: visitKeyPrefix, $lte: `${visitKeyPrefix}\uffff`},
        },
        // Sort them by time, newest first
        sort: [{'_id': 'desc'}],
    }).then(
        normaliseFindResult
    ).then(visitsResult =>
        insertPagesIntoVisits({visitsResult, pagesResult})
    )
}

// Expand the results, adding preceding and succeding visits around each visit.
export function addRelatedVisits({visitsResult, maxPerVisit=2}) {
    const promises = visitsResult.rows.map(row => {
        const timestamp = getTimestamp(row.doc)
        const timeWindow = 1000*60*20
        // Get preceding visits
        return db.allDocs({
            include_docs: true,
            // Subtract 1ms to exclude itself (there is no exclude_start option).
            startkey: convertVisitDocId({timestamp: timestamp-1}),
            endkey: convertVisitDocId({timestamp: timestamp-timeWindow}),
            descending: true,
            limit: maxPerVisit,
        }).then(prequelResult => {
            // Get succeeding visits
            return db.allDocs({
                include_docs: true,
                // Add 1ms to exclude itself (there is no exclude_start option).
                startkey: convertVisitDocId({timestamp: timestamp+1}),
                endkey: convertVisitDocId({timestamp: timestamp+timeWindow}),
                limit: maxPerVisit,
            }).then(sequelResult => ({
                // Combine them as if they were one result.
                rows: prequelResult.rows.concat(sequelResult.rows)
            }))
        }).then(result =>
            result // TODO Limit combined results to maxPerVisit?
        ).then(result =>
            // Insert pages as usual.
            insertPagesIntoVisits({visitsResult: result})
        ).then(
            // Mark the row (not the doc!) as being a 'contextual result'.
            update('rows', rows =>
                rows.map(update('isContextualResult', () => true))
            )
        )
    })
    return Promise.all(promises).then(contextResults =>
        // Insert the contexts (prequels+sequels) into the original results
        update('rows', rows => {
            // Concat all results and all their contexts, but remove duplicates.
            const allRows = unionBy(rows,
                ...contextResults.map(result => result.rows),
                'doc._id') // id as uniqueness criterion
            // Sort them again by timestamp (= id)
            return reverse(sortBy('doc._id')(allRows))
        })(visitsResult)
    )
}
