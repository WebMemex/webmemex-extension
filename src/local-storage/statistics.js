import get from 'lodash/fp/get'

import { getAllPages } from '.'

export async function getStatistics() {
    const pagesResult = await getAllPages()

    const numberOfPages = pagesResult.total_rows

    const totalSizeOfPages = pagesResult.rows
        .map(row => get(['_attachments', 'frozen-page.html', 'length'])(row.doc) || 0)
        .reduce((acc, pageSize) => acc + pageSize, 0)

    return { numberOfPages, totalSizeOfPages }
}
