import db from 'src/pouchdb'
import { generatePageDocId } from '.'

export async function createPageStub({ url }) {
    const pageId = generatePageDocId()
    const page = {
        _id: pageId,
        url,
    }
    await db.put(page)
    return page
}
