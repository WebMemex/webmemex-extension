import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Button, Divider, Header, Icon, List, Menu, Message } from 'semantic-ui-react'

import { hrefForLocalPage } from 'src/local-page'
import { getPagesByUrl, downloadPage } from 'src/page-storage'
import niceTime from 'src/util/nice-time'
import { remoteFunction } from 'src/util/webextensionRPC'

const storeActivePage = remoteFunction('storeActivePage')

// Heuristic to decide whether a page can be stored.
function isStorable({url}) {
    // Only http(s) pages for now. Ignoring data URLs, newtab, ...
    const storableUrlPattern = /^https?:\/\//
    return storableUrlPattern.test(url)
}

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
                    {niceTime(page.timestamp)}
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

        this.state = {
            snapshotState: 'initial',
        }
    }

    componentDidMount() {
        this.getPreviousSnapshots(this.props.url)
    }

    async storeThisPage() {
        this.setState({ snapshotState: 'shooting' })

        let page
        try {
            const { page: page_ } = await storeActivePage()
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

    async getPreviousSnapshots(url) {
        const pagesResult = await getPagesByUrl({url})
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

    render() {
        const { url } = this.props

        const {
            snapshotState,
            snapshottedPage,
            errorMessage,
            previousSnapshots,
        } = this.state

        const snapshottable = isStorable({url})

        return (
            <Menu vertical fluid borderless>
                {snapshottable && (
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
                )}
                {snapshottable && (
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
                )}
                {!snapshottable && (
                    <Menu.Item style={{textAlign: 'center'}}>
                        <em className='faint'>
                            Cannot snapshot this page.
                        </em>
                    </Menu.Item>
                )}
                <Divider />
                <Menu.Item>
                    <Button fluid onClick={this.openOverview}>
                        <Icon name='list layout' />
                        See all your snapshots
                    </Button>
                </Menu.Item>
            </Menu>
        )
    }
}

Main.propTypes = {
    url: PropTypes.string,
}


async function main() {
    const url = (await browser.tabs.query({active: true, currentWindow: true}))[0].url

    ReactDOM.render(
        <Main url={url} />,
        document.getElementById('app')
    )
}
main()
