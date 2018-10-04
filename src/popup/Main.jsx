import React from 'react'
import PropTypes from 'prop-types'
import { Button, Divider, Icon, Menu, Message } from 'semantic-ui-react'

import shortUrl from 'src/util/short-url'
import TakeSnapshotButton from './TakeSnapshotButton'
import SnapshotList from './SnapshotList'
import LinkOpenInTab from './LinkOpenInTab'
import styles from './Main.css'

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
        const { tabId, tabUrl, snapshotInfo, canTakeSnapshot, shouldBeSnapshottable } = this.props
        const { lastModificationTime } = this.state

        const isSnapshot = !!snapshotInfo

        // When viewing a snapshot, don't list snapshots of the snapshot, but of the original.
        const originalUrl = isSnapshot
            ? snapshotInfo.originalUrl
            : tabUrl

        return (
            <Menu vertical fluid borderless>
                {canTakeSnapshot && (
                    <TakeSnapshotButton
                        {...this.state}
                        onSnapshotted={this.updateModificationTime}
                    />
                )}
                {isSnapshot && (
                    <Menu.Item>
                        <Message info className={styles.thisIsASnapshotMessage}>
                            You are viewing a snapshot of:<br />
                            <LinkOpenInTab
                                className={styles.url}
                                href={snapshotInfo.originalUrl}
                                title={snapshotInfo.originalUrl}
                                tabId={tabId}
                            >
                                {shortUrl(snapshotInfo.originalUrl)}
                            </LinkOpenInTab>
                        </Message>
                    </Menu.Item>
                )}
                {!(isSnapshot || canTakeSnapshot) && (
                    <Menu.Item style={{ textAlign: 'center' }}>
                        <em className='faint'>
                            Cannot snapshot this page.
                            {shouldBeSnapshottable && (
                                <p>
                                    (was this extension just installed/enabled <b>after</b> this
                                    page was loaded?)
                                </p>
                            )}
                        </em>
                    </Menu.Item>
                )}
                {(isSnapshot || canTakeSnapshot || shouldBeSnapshottable) && (
                    <SnapshotList
                        originalUrl={originalUrl}
                        currentlyViewedUrl={tabUrl}
                        lastModificationTime={lastModificationTime}
                    />
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
    canTakeSnapshot: PropTypes.bool,
    shouldBeSnapshottable: PropTypes.bool,
}
