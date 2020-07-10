import db from 'src/pouchdb'
import { isStoredInDownloads } from 'src/local-page'

export async function deletePage({ page }) {
    await db.remove(page)
    if (isStoredInDownloads(page)) {
        await browser.downloads.removeFile(page.download.id)
    }
}
