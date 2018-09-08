import React from 'react'
import PropTypes from 'prop-types'
import { Button, Divider, Header, Icon, Menu } from 'semantic-ui-react'

import TakeSnapshotButton from './TakeSnapshotButton'
import SnapshotList from './SnapshotList'
import LinkOpenInTab from './LinkOpenInTab'

// Heuristic to decide whether a page can be stored.
function isStorable({ url }) {
    // Only http(s) pages for now. Ignoring data URLs, newtab, ...
    const storableUrlPattern = /^https?:\/\//
    return storableUrlPattern.test(url)
}

export default class Main extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        this.openOverview = this.openOverview.bind(this)
        this.updateModificationTime = this.updateModificationTime.bind(this)
    }

    async openOverview() {
        await browser.tabs.create({
            url: '/overview.html',
        })
        window.close()
    }

    updateModificationTime() {
        this.setState({
            lastModificationTime: Date.now(),
        })
    }

    render() {
        const { tabId, tabUrl, snapshotInfo } = this.props
        const { lastModificationTime } = this.state

        const isSnapshot = !!snapshotInfo
        const snapshottable = !isSnapshot && isStorable({ url: tabUrl })

        // When viewing a snapshot, don't list snapshots of the snapshot, but of the original.
        const originalUrl = isSnapshot
            ? snapshotInfo.originalUrl
            : tabUrl

        return (
            <Menu vertical fluid borderless>
                {snapshottable && (
                    <TakeSnapshotButton
                        {...this.state}
                        onSnapshotted={this.updateModificationTime}
                    />
                )}
                {isSnapshot && (
                    <Menu.Item>
                        This is a snapshot of{' '}
                        <LinkOpenInTab
                            href={snapshotInfo.originalUrl}
                            tabId={tabId}
                        >
                            {snapshotInfo.originalUrl}
                        </LinkOpenInTab>
                    </Menu.Item>
                )}
                {!(isSnapshot || snapshottable) && (
                    <Menu.Item style={{ textAlign: 'center' }}>
                        <em className='faint'>
                            Cannot snapshot this page.
                        </em>
                    </Menu.Item>
                )}
                {(snapshottable || isSnapshot) && (
                    <Menu.Item>
                        <Header size='tiny'>
                            Your snapshots of this page:
                        </Header>
                        <SnapshotList
                            originalUrl={originalUrl}
                            currentlyViewedUrl={tabUrl}
                            lastModificationTime={lastModificationTime}
                        />
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
    tabId: PropTypes.number,
    tabUrl: PropTypes.string,
    snapshotInfo: PropTypes.object,
}
