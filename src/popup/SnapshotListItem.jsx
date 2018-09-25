import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Icon, List } from 'semantic-ui-react'

import { absoluteUrlForLocalPage } from 'src/local-page'
import { deletePage } from 'src/local-storage'
import { SaveAsButton, DeleteButton } from 'src/common-components'
import niceTime from 'src/util/nice-time'
import LinkOpenInTab from './LinkOpenInTab'
import styles from './SnapshotListItem.css'

export default class SnapshotListItem extends React.Component {
    render() {
        const { page, isBeingViewed, refreshSnapshotList } = this.props

        return (
            <List.Item>
                <List.Content
                    className={classNames(styles.listContent, { [styles.highlight]: isBeingViewed })}
                    as={LinkOpenInTab}
                    href={absoluteUrlForLocalPage(page)}
                    title={!isBeingViewed ? 'View this snapshot' : 'Currently displayed'}
                >
                    <div>
                        <Icon name='camera' />
                        {niceTime(page.timestamp)}
                    </div>
                    <SaveAsButton className={styles.showOnHover} page={page} />
                    <DeleteButton
                        className={styles.showOnHover}
                        onClick={async () => {
                            await deletePage({ page })
                            refreshSnapshotList()
                        }}
                    />
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
