import React from 'react'
import PropTypes from 'prop-types'
import { List } from 'semantic-ui-react'

import { absoluteUrlForLocalPage } from 'src/local-page'
import { getPagesByUrl } from 'src/local-storage'
import SnapshotListItem from './SnapshotListItem'

export default class SnapshotList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        this.refreshSnapshotList = this.refreshSnapshotList.bind(this)
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
                            <SnapshotListItem
                                key={page._id}
                                page={page}
                                highlight={absoluteUrlForLocalPage(page) === currentlyViewedUrl}
                                refreshSnapshotList={this.refreshSnapshotList}
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
