import update from 'lodash/fp/update'

import db, { normaliseFindResult, keyRangeForPrefix } from 'src/pouchdb'
import { revisePageFields } from 'src/page-capture'
import { pageKeyPrefix, convertPageDocId } from '.'

// Post-process result list after any retrieval of pages from the database.
async function postprocessPagesResult({ pagesResult }) {
    pagesResult = update('rows', rows => rows.map(
        update('doc', postProcessPage)
    ))(pagesResult)

    return pagesResult
}

export const postProcessPage = page => ({
    // Let the page-capture module augment or revise the document's attributes.
    ...revisePageFields(page),
    // The creation time is encoded in the doc._id; expose it for convenience.
    timestamp: Number.parseInt(convertPageDocId(page._id).timestamp),
})

export async function getPage({ pageId }) {
    const pagesResult = await getPages({ pageIds: [pageId] })
    return pagesResult.rows[0].doc
}

// Get all pages for a given array of page ids
export async function getPages({ pageIds }) {
    let pagesResult = await db.allDocs({
        keys: pageIds,
        include_docs: true,
    })
    pagesResult = await postprocessPagesResult({ pagesResult })
    return pagesResult
}

export async function getAllPages() {
    let pagesResult = await db.allDocs({
        ...keyRangeForPrefix(pageKeyPrefix),
        include_docs: true,
    })
    pagesResult = await postprocessPagesResult({ pagesResult })
    return pagesResult
}

export async function getPagesByUrl({ url }) {
    const findResult = await db.find({
        selector: {
            _id: { $gte: pageKeyPrefix, $lte: `${pageKeyPrefix}\uffff` },
            url,
        },
    })
    let pagesResult = normaliseFindResult(findResult)
    pagesResult = await postprocessPagesResult({ pagesResult })
    return pagesResult
}

// Find pages in the given date range (and/or up to the given limit), sorted by time (descending).
export async function getPagesByDate({ startDate, endDate, limit, skipUntil }) {
    let selector = {
        // Constrain by id (like with startkey/endkey), both to get only the
        // page docs, and (if needed) to filter the pages after/before a
        // given timestamp (this compares timestamps lexically, which only
        // works while they are of the same length, so we should fix this by
        // 2286).
        _id: {
            $gte: startDate !== undefined
                ? convertPageDocId({ timestamp: startDate })
                : pageKeyPrefix,
            $lte: endDate !== undefined
                ? convertPageDocId({ timestamp: endDate })
                : `${pageKeyPrefix}\uffff`,
            $lt: skipUntil,
        },
    }

    let findResult = await db.find({
        selector,
        // Sort them by time, newest first
        sort: [{ '_id': 'desc' }],
        // limit, // XXX pouchdb-find seems to mess up when passing a limit...
    })
    // ...so we apply the limit ourselves.
    findResult = update('docs', docs => docs.slice(0, limit))(findResult)

    let pagesResult = normaliseFindResult(findResult)
    pagesResult = await postprocessPagesResult({ pagesResult })
    return pagesResult
}
