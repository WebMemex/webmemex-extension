import db from 'src/pouchdb'
import { generatePageDocId, postProcessPage } from '.'

export async function createPage({ url, favIcon, screenshot, pageContent, frozenPage }, downloadItem) {
    const pageId = generatePageDocId()

    const page = {
        _id: pageId,
        download: downloadItem && {
            id: downloadItem.id,
            filename: downloadItem.filename,
        },
        url,
        content: pageContent,
        _attachments: {
            favIcon: favIcon && { content_type: favIcon.type, data: favIcon },
            screenshot: screenshot && { content_type: screenshot.type, data: screenshot },
            'frozen-page.html': frozenPage && { content_type: frozenPage.type, data: frozenPage },
        },
    }

    await db.put(page)

    // Return the page just as getPage would return it.
    return postProcessPage(page)
}
