import db from 'src/pouchdb'
import analysePage from 'src/page-analysis/background'
import { generatePageDocId } from '.'

async function createPageStub({ url }) {
    const pageId = generatePageDocId()
    const page = {
        _id: pageId,
        url,
    }
    await db.put(page)
    return page
}

// Analyses the page in the specified tab. Returns the object for the page created in the database,
// and a promise that will return the final page after analysis has completed.
export async function storePage({ tabId, url }) {
    // Create a new page doc in the database.
    const page = await createPageStub({ url })

    // Run analysis.
    const { page: finalPage } = await analysePage({
        tabId,
        page,
    })

    return { page: finalPage }
}
