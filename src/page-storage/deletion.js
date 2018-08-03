import db from 'src/pouchdb'

export async function deletePage({ page }) {
    await db.remove(page)
}
