import React from 'react'
import ReactDOM from 'react-dom'
import { Button, Icon, Image } from 'semantic-ui-react'
import { blobToArrayBuffer } from 'blob-util'

import db from 'src/pouchdb'
import { downloadPage } from 'src/page-storage/download-page'
import { getPage } from 'src/search/find-pages'
import { getTimestamp } from 'src/activity-logger'
import shortUrl from 'src/util/short-url'
import niceTime from 'src/util/nice-time'

import ContentFrame from './ContentFrame'


async function showPage(pageId) {
    const page = await getPage({pageId, followRedirects: true})
    if (page._id !== pageId) {
        // Apparently getPage followed one or more redirects. Reload the viewer
        // with the resolved page's id in the ?page query.
        const location = new URL(window.location)
        location.searchParams.set('page', page._id)
        window.location = location
    }
    const timestamp = getTimestamp(page)

    // Read the html file from the database.
    const blob = await db.getAttachment(pageId, 'frozen-page.html')
    // We assume utf-8 encoding. TODO: read encoding from document.
    const html = new TextDecoder('utf-8').decode(await blobToArrayBuffer(blob))

    document.title = `${page.title}`

    const bar = (
        <div id='bar'>
            <Image
                title='WebMemex'
                src='assets/webmemex-32.png'
                as='a'
                href='/overview.html'
                wrapped />
            <span id='description'>
                <Icon name='camera' />
                Snapshot of
                <a href={page.url} style={{margin: '0 4px'}}>
                    {shortUrl(page.url)}
                </a>
                <Icon name='clock' />
                <time dateTime={new Date(timestamp)}>
                    {niceTime(timestamp)}
                </time>
            </span>
            <Button
                compact
                size='tiny'
                onClick={() => downloadPage({page, saveAs: true})}
            >
                <Icon name='download' />
                Save page as…
            </Button>
        </div>
    )
    ReactDOM.render(
        <div id='rootContainer'>
            {bar}
            <ContentFrame html={html} />
        </div>,
        document.getElementById('app')
    )
}

// Read pageId from location: ?page=pageId
const pageId = new URL(window.location).searchParams.get('page')
showPage(pageId)
