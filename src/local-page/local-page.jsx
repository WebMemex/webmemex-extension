import React from 'react'
import ReactDOM from 'react-dom'
import { Icon, Image } from 'semantic-ui-react'

import { getPage, getPageHtml, deletePage } from 'src/local-storage'
import shortUrl from 'src/util/short-url'
import niceTime from 'src/util/nice-time'

import ContentFrame from './ContentFrame'
import { SaveAsButton, DeleteButton } from 'src/common-components'

async function showPage(pageId) {
    const containerElement = document.getElementById('app')

    let page
    try {
        page = await getPage({ pageId })
    } catch (err) {
        let content
        if (err.status === 404) {
            content = <span>
                Snapshot not found
                {err.reason === 'deleted' && ' (it has been deleted)'}
            </span>
        } else {
            content = 'Unknown error'
        }
        ReactDOM.render(<h1>{content}</h1>, containerElement)
        throw err
    }

    const html = await getPageHtml({ pageId })
    const timestamp = page.timestamp

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
                <a href={page.url} style={{ margin: '0 4px' }}>
                    {shortUrl(page.url)}
                </a>
                <Icon name='clock' />
                <time dateTime={new Date(timestamp)}>
                    {niceTime(timestamp)}
                </time>
            </span>
            <SaveAsButton page={page} label />
            <DeleteButton
                page={page}
                onClick={async () => {
                    await deletePage({ page })
                    window.location.replace('about:blank')
                }}
                label
            />
        </div>
    )
    ReactDOM.render(
        <div id='rootContainer'>
            {bar}
            <ContentFrame html={html} />
        </div>,
        containerElement
    )
}

// Read pageId from location: ?page=pageId
const pageId = new URL(window.location).searchParams.get('page')
showPage(pageId)
