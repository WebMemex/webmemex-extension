import db from 'src/pouchdb'
import { generatePageDocId, postProcessPage } from '.'

export async function createPage({ url, favIcon, screenshot, pageContent, frozenPage }) {
    const pageId = generatePageDocId()
    const page = {
        _id: pageId,
        url,
        content: pageContent,
        _attachments: {
            favIcon: favIcon && { content_type: favIcon.type, data: favIcon },
            screenshot: screenshot && { content_type: screenshot.type, data: screenshot },
            'frozen-page.html': { content_type: frozenPage.type, data: frozenPage },
        },
    }

    await db.put(page)

    // Return the page just as getPage would return it.
    return postProcessPage(page)
}
