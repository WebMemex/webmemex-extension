import { getAllPages } from '.'

export async function getStatistics() {
    const pagesResult = await getAllPages()

    const numberOfSnapshots = pagesResult.total_rows

    const numberOfSnapshotsStoredInsideExtension = pagesResult.rows.filter(row => row.doc._attachments && row.doc._attachments['frozen-page.html']).length

    const totalSnapshotSizeInsideExtension = pagesResult.rows
        .map(row => row.doc._attachments && row.doc._attachments['frozen-page.html'] && row.doc._attachments['frozen-page.html'].length || 0)
        .reduce((acc, pageSize) => acc + pageSize, 0)

    return {
        numberOfSnapshots,
        numberOfSnapshotsStoredInsideExtension,
        totalSnapshotSizeInsideExtension,
    }
}
