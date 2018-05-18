import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Button, Checkbox, Divider, Header, Icon, List, Menu, Message } from 'semantic-ui-react'

import { hrefForLocalPage } from 'src/local-page'
import { findPagesByUrl } from 'src/search/find-pages'
import { getTimestamp } from 'src/activity-logger'
import { downloadPage } from 'src/page-storage/download-page'
import niceTime from 'src/util/nice-time'
import { remoteFunction } from 'src/util/webextensionRPC'


const logActivePageVisit = remoteFunction('logActivePageVisit')


const PageAsListItem = ({ page, highlight }) => {
    return (
        <List.Item className={classNames({highlight})}>
            <List.Content
                className='listContent'
                href={hrefForLocalPage({page})}
                target='_blank'
                title='View the snapshot'
            >
                <div>
                    <Icon name='camera' />
                    {niceTime(getTimestamp(page))}
                </div>
                <Button
                    icon
                    size='tiny'
                    onClick={event => { event.preventDefault(); downloadPage({page, saveAs: true}) }}
                    title='Save page as…'
                >
                    {highlight && 'Save as…'}
                    <Icon name='download' />
                </Button>
            </List.Content>
        </List.Item>
    )
}

PageAsListItem.propTypes = {
    page: PropTypes.object,
    highlight: PropTypes.bool,
}

class Main extends React.Component {
    constructor(props) {
        super(props)
        this.storeThisPage = this.storeThisPage.bind(this)
        this.openOverview = this.openOverview.bind(this)
        this.toggleLoggingEnabled = this.toggleLoggingEnabled.bind(this)

        this.state = {
            snapshotState: 'initial',
        }
    }

    componentDidMount() {
        this.getPreviousSnapshots()
        this.loadSettings()
    }

    async storeThisPage() {
        this.setState({ snapshotState: 'shooting' })

        let page
        try {
            const { page: page_ } = await logActivePageVisit()
            page = page_
        } catch (err) {
            this.setState({
                snapshotState: 'error',
                errorMessage: `Error: ${err && err.message}`,
            })
            return
        }
        this.setState(state => ({
            ...state,
            snapshotState: 'success',
            snapshottedPage: page,
            previousSnapshots: [page, ...state.previousSnapshots],
        }))
    }

    async getPreviousSnapshots() {
        const url = (await browser.tabs.query({active: true, currentWindow: true}))[0].url
        const pagesResult = await findPagesByUrl({url})
        const previousSnapshots = pagesResult.rows.map(row => row.doc)
        previousSnapshots.reverse() // sorts most recent first
        this.setState({
            previousSnapshots,
        })
    }

    async openOverview() {
        await browser.tabs.create({
            url: '/overview.html',
        })
        window.close()
    }

    async loadSettings() {
        // Load initial checkbox value from storage
        // (note that we do not keep this value in sync bidirectionally; should be okay for a popup)
        const { loggingEnabled } = await browser.storage.local.get('loggingEnabled')
        this.setState({
            loggingEnabled,
        })
    }

    async toggleLoggingEnabled(event, { checked }) {
        await browser.storage.local.set({ loggingEnabled: checked })
        // refresh the UI.
        await this.loadSettings()
    }

    render() {
        const {
            snapshotState,
            snapshottedPage,
            errorMessage,
            previousSnapshots,
            loggingEnabled,
        } = this.state

        return (
            <Menu vertical fluid borderless>
                <Menu.Item>
                    {snapshotState === 'initial' && (
                        <Button fluid primary onClick={this.storeThisPage}>
                            <Icon name='camera' />
                            Snapshot this page
                        </Button>
                    )}
                    {snapshotState === 'shooting' && (
                        <Button fluid primary disabled>
                            <Icon name='camera' loading />
                            Taking snapshot...
                        </Button>
                    )}
                    {snapshotState === 'success' && (
                        <Button
                            fluid
                            positive
                            href={hrefForLocalPage({page: snapshottedPage})}
                            target='_blank'
                            title='View the snapshot'
                        >
                            <Icon name='check' />
                            Stored.
                        </Button>
                    )}
                    {snapshotState === 'error' && (
                        <Message error>
                            <Icon name='warning' />
                            {errorMessage}
                        </Message>
                    )}
                </Menu.Item>
                <Menu.Item>
                    <Header size='tiny'>
                        Your previous snapshots of this page:
                    </Header>
                    <List divided relaxed verticalAlign='middle'>
                        {previousSnapshots === undefined
                            ? <List.Item className='faint'>digging..</List.Item>
                            : previousSnapshots.length === 0
                                ? <List.Item className='faint'>No snapshots yet</List.Item>
                                : previousSnapshots.map(page => (
                                    <PageAsListItem
                                        key={page._id}
                                        page={page}
                                        highlight={page === snapshottedPage}
                                    />
                                ))
                        }
                    </List>
                </Menu.Item>
                <Divider />
                <Menu.Item>
                    <Button fluid onClick={this.openOverview}>
                        <Icon name='list layout' />
                        See all your snapshots
                    </Button>
                </Menu.Item>
                <Menu.Item>
                    {loggingEnabled !== undefined && (
                        <Checkbox
                            checked={loggingEnabled}
                            toggle
                            label={(
                                <label>
                                    Store <em>every</em> visited webpage <em>(experimental)</em>
                                </label>
                            )}
                            onChange={this.toggleLoggingEnabled}
                        />
                    )}
                </Menu.Item>
            </Menu>
        )
    }
}

ReactDOM.render(
    <Main />,
    document.getElementById('app')
)
