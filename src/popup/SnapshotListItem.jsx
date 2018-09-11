import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Button, Icon, List } from 'semantic-ui-react'

import { absoluteUrlForLocalPage } from 'src/local-page'
import { downloadPage, deletePage } from 'src/local-storage'
import niceTime from 'src/util/nice-time'
import LinkOpenInTab from './LinkOpenInTab'

export default class SnapshotListItem extends React.Component {
    render() {
        const { page, highlight, refreshSnapshotList } = this.props

        return (
            <List.Item className={classNames({ highlight })}>
                <List.Content
                    as={LinkOpenInTab}
                    className='listContent'
                    href={absoluteUrlForLocalPage(page)}
                    title='View the snapshot'
                >
                    <div>
                        <Icon name='camera' />
                        {niceTime(page.timestamp)}
                    </div>
                    <Button
                        className='downloadButton'
                        icon
                        size='tiny'
                        onClick={event => {
                            event.preventDefault()
                            event.stopPropagation()
                            downloadPage({ page, saveAs: true })
                        }}
                        title='Save page as…'
                    >
                        <Icon name='download' />
                    </Button>
                    <Button
                        className='downloadButton'
                        icon
                        size='tiny'
                        onClick={async event => {
                            event.preventDefault()
                            event.stopPropagation()
                            await deletePage({ page })
                            refreshSnapshotList()
                        }}
                        title='Delete this snapshot'
                    >
                        <Icon name='trash' />
                    </Button>
                </List.Content>
            </List.Item>
        )
    }
}

SnapshotListItem.propTypes = {
    page: PropTypes.object,
    highlight: PropTypes.bool,
    refreshSnapshotList: PropTypes.func,
}
