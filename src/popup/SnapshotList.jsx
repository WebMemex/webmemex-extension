import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Button, Icon, List } from 'semantic-ui-react'

import { absoluteUrlForLocalPage } from 'src/local-page'
import { getPagesByUrl, downloadPage } from 'src/local-storage'
import niceTime from 'src/util/nice-time'
import LinkOpenInTab from './LinkOpenInTab'

export default class SnapshotList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.refreshSnapshotList()
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.originalUrl !== prevProps.originalUrl
            || this.props.lastModificationTime !== prevProps.lastModificationTime
        ) {
            this.refreshSnapshotList()
        }
    }

    async refreshSnapshotList() {
        const { originalUrl } = this.props

        const pagesResult = await getPagesByUrl({ url: originalUrl })
        const previousSnapshots = pagesResult.rows.map(row => row.doc)
        previousSnapshots.reverse() // sorts most recent first
        this.setState({
            previousSnapshots,
        })
    }

    render() {
        const { currentlyViewedUrl } = this.props
        const { previousSnapshots } = this.state

        return (
            <List divided relaxed verticalAlign='middle'>
                {previousSnapshots === undefined
                    ? <List.Item className='faint'>digging..</List.Item>
                    : previousSnapshots.length === 0
                        ? <List.Item className='faint'>No snapshots yet</List.Item>
                        : previousSnapshots.map(page => (
                            <SnapshotAsListItem
                                key={page._id}
                                page={page}
                                highlight={absoluteUrlForLocalPage(page) === currentlyViewedUrl}
                            />
                        ))
                }
            </List>
        )
    }
}

SnapshotList.propTypes = {
    originalUrl: PropTypes.string,
    currentlyViewedUrl: PropTypes.string,
    lastModificationTime: PropTypes.number,
}

const SnapshotAsListItem = ({ page, highlight }) => {
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
                        downloadPage({ page, saveAs: true })
                    }}
                    title='Save page as…'
                >
                    Save as…
                    <Icon name='download' />
                </Button>
            </List.Content>
        </List.Item>
    )
}

SnapshotAsListItem.propTypes = {
    page: PropTypes.object,
    highlight: PropTypes.bool,
}
