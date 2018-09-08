import React from 'react'
import PropTypes from 'prop-types'
import { Button, Icon, Menu, Message } from 'semantic-ui-react'

import { remoteFunction } from 'src/util/webextensionRPC'
import { absoluteUrlForLocalPage } from 'src/local-page'
import LinkOpenInTab from './LinkOpenInTab'

const storeActivePage = remoteFunction('storeActivePage')

export default class TakeSnapshotButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            snapshotState: 'initial',
        }

        this.takeSnapshot = this.takeSnapshot.bind(this)
    }

    async takeSnapshot() {
        this.setState({ snapshotState: 'shooting' })

        let snapshottedPage
        try {
            snapshottedPage = (await storeActivePage()).page
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
            snapshottedPage: snapshottedPage,
        }))
    }

    render () {
        const {
            snapshotState,
            errorMessage,
            snapshottedPage,
        } = this.state

        return (
            <Menu.Item>
                {snapshotState === 'initial' && (
                    <Button fluid primary onClick={this.takeSnapshot}>
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
                        as={LinkOpenInTab}
                        fluid
                        positive
                        href={absoluteUrlForLocalPage(snapshottedPage)}
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
        )
    }
}

TakeSnapshotButton.propTypes = {
}
