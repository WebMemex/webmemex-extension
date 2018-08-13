import { blobToArrayBuffer } from 'blob-util'

import db from 'src/pouchdb'

export async function getPageBlob({ page, pageId = page._id }) {
    const blob = await db.getAttachment(pageId, 'frozen-page.html')
    return blob
}

export async function getPageHtml({ page, pageId = page._id }) {
    const blob = await getPageBlob({ pageId })
    // We assume utf-8 encoding; TODO check if that can go wrong.
    const html = new TextDecoder('utf-8').decode(await blobToArrayBuffer(blob))
    return html
}
