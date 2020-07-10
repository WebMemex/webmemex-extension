import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import { Icon, Image } from 'semantic-ui-react'

import { getPage, getPageHtml, deletePage } from 'src/local-storage'
import { SaveAsButton, DeleteButton } from 'src/common-components'
import shortUrl from 'src/util/short-url'
import niceTime from 'src/util/nice-time'

import { isStoredInternally } from '.'
import ContentFrame from './ContentFrame'

const SnapshotChrome = ({ children }) => (
    <div id='bar'>
        <Image
            title='WebMemex'
            src='assets/webmemex-32.png'
            as='a'
            href='/overview.html'
            wrapped
        />
        {children}
    </div>
)

SnapshotChrome.propTypes = {
    children: PropTypes.node,
}

async function showPage(pageId) {
    const containerElement = document.getElementById('app')

    let page
    try {
        page = await getPage({ pageId })
    } catch (err) {
        let message
        if (err.status === 404 && err.reason === 'deleted') {
            message = 'This snapshot has been deleted'
        } else if (err.status === 404) {
            message = 'Snapshot not found'
        } else {
            message = 'Unknown error'
        }

        ReactDOM.render(
            <div id='rootContainer'>
                <SnapshotChrome>
                    <div id='errorMessage'>
                        {message}
                    </div>
                </SnapshotChrome>
                <div id='page' className='placeholder' />
            </div>,
            containerElement,
        )
        throw err
    }

    const html = await getPageHtml({ pageId })
    const timestamp = page.timestamp

    document.title = `${page.title}`

    ReactDOM.render(
        <div id='rootContainer'>
            <SnapshotChrome>
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
                {isStoredInternally(page) && <SaveAsButton page={page} label />}
                <DeleteButton
                    page={page}
                    onClick={async () => {
                        await deletePage({ page })
                        window.location.replace(window.location)
                    }}
                    label
                />
            </SnapshotChrome>
            <ContentFrame html={html} />
        </div>,
        containerElement,
    )
}

// Read pageId from location: ?page=pageId
const pageId = new URL(window.location).searchParams.get('page')
showPage(pageId)
