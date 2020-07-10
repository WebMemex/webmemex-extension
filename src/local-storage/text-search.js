import get from 'lodash/fp/get'
import last from 'lodash/fp/last'

import { searchableTextFields } from 'src/page-capture'
import { getPagesByDate } from '.'

// Search by keyword query, returning all docs if no query is given
export async function filterPagesByQuery({
    query,
    startDate,
    endDate,
    skipUntil,
    limit = 10,
    softLimit = false,
    maxWaitDuration = 1000,
}) {
    if (limit <= 0) {
        return {
            rows: [],
            resultsExhausted: true,
        }
    }
    if (query === '') {
        const pagesResult = await getPagesByDate({ startDate, endDate, limit, skipUntil })
        // Note whether we reached the bottom.
        pagesResult.resultsExhausted = pagesResult.rows.length < limit
        return pagesResult
    } else {
        // Process pages batch by batch, filtering for ones that match the
        // query until we reach the requested limit or have exhausted all
        // of them.

        let rows = []
        let resultsExhausted = false
        // Number of pages we process at a time (rather arbitrary)
        const batchSize = 50
        // Time when we have to report back with what we got so far, in case we keep searching.
        const reportingDeadline = Date.now() + maxWaitDuration
        do {
            const batch = await getPagesByDate({
                startDate,
                endDate,
                limit: batchSize,
                skipUntil,
            })
            const batchRows = batch.rows

            // Check if we reached the bottom.
            resultsExhausted = batchRows.length < batchSize

            // Next batch (or next invocation), start from the last result.
            skipUntil = (batchRows.length > 0)
                ? last(batchRows).id
                : skipUntil

            // Filter for pages that contain the query words.
            const hits = batchRows.filter(
                row => pageMatchesQuery({ page: row.doc, query }),
            )

            rows = rows.concat(hits)
        } while (
            // If we did not have enough hits, get and filter another batch...
            rows.length < limit && !resultsExhausted
            // ...except if we did already find something and our user may be getting impatient.
            && !(rows.length >= 1 && Date.now() > reportingDeadline)
        )

        // If the limit is hard, cap the number of results.
        if (!softLimit && rows.length > limit) {
            rows = rows.slice(0, limit)
            resultsExhausted = false
            skipUntil = last(rows).id
        }

        const result = {
            rows,
            // Remember the last docId, to continue from there when more results
            // are requested.
            searchedUntil: skipUntil,
            resultsExhausted,
        }

        return result
    }
}

// We just use a simple literal word filter for now. No index, no ranking.
function pageMatchesQuery({ page, query }) {
    // Get page text fields.
    const texts = searchableTextFields.map(fieldName => get(fieldName)(page))
        .filter(text => text) // remove undefined fields
        .map(text => text.toString().toLowerCase())

    // Test if every word in the query is present in at least one text field.
    const queryWords = query.toLowerCase().trim().split(/\s+/)
    return queryWords.every(word =>
        texts.some(text => text.includes(word)),
    )
}
