import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Popup, Button, Icon, List } from 'semantic-ui-react'

import { absoluteUrlForLocalPage } from 'src/local-page'
import { downloadPage, deletePage } from 'src/local-storage'
import niceTime from 'src/util/nice-time'
import LinkOpenInTab from './LinkOpenInTab'

export default class SnapshotListItem extends React.Component {
    render() {
        const { page, isBeingViewed, refreshSnapshotList } = this.props

        const downloadButton = (
            <Button
                icon
                size='tiny'
                onClick={event => {
                    event.preventDefault()
                    event.stopPropagation()
                    downloadPage({ page, saveAs: true })
                }}
                title='Save snapshot as…'
            >
                <Icon name='download' />
            </Button>
        )

        const deleteButton = (
            <Popup
                trigger={
                    <Button
                        icon='trash'
                        size='tiny'
                        onClick={async event => {
                            event.preventDefault()
                            event.stopPropagation()
                        }}
                        title='Delete this snapshot'
                    />
                }
                content={
                    <Button
                        negative
                        content='Delete this snapshot'
                        onClick={async event => {
                            event.preventDefault()
                            event.stopPropagation()
                            await deletePage({ page })
                            refreshSnapshotList()
                        }}
                    />
                }
                on='focus'
                hoverable
                position='right center'
            />
        )

        return (
            <List.Item className={classNames({ highlight: isBeingViewed })}>
                <List.Content
                    className='listContent'
                    as={!isBeingViewed ? LinkOpenInTab : undefined}
                    href={!isBeingViewed ? absoluteUrlForLocalPage(page) : undefined}
                    title={!isBeingViewed ? 'View this snapshot' : 'Currently displayed'}
                >
                    <div>
                        <Icon name='camera' />
                        {niceTime(page.timestamp)}
                    </div>
                    {downloadButton}
                    {deleteButton}
                </List.Content>
            </List.Item>
        )
    }
}

SnapshotListItem.propTypes = {
    page: PropTypes.object,
    isBeingViewed: PropTypes.bool,
    refreshSnapshotList: PropTypes.func,
}
