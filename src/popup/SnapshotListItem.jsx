import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Icon, List } from 'semantic-ui-react'

import { deletePage } from 'src/local-storage'
import { SaveAsButton, DeleteButton } from 'src/common-components'
import { isStoredInternally } from 'src/local-page'
import niceTime from 'src/util/nice-time'

import LinkToSnapshotOpenInTab from './LinkToSnapshotOpenInTab'
import styles from './SnapshotListItem.css'

export default class SnapshotListItem extends React.Component {
    render() {
        const { page, isBeingViewed, refreshSnapshotList } = this.props

        return (
            <List.Item>
                <List.Content
                    className={classNames(styles.listContent, { [styles.highlight]: isBeingViewed })}
                    as={LinkToSnapshotOpenInTab}
                    page={page}
                    title={!isBeingViewed ? 'View this snapshot' : 'Currently displayed'}
                >
                    <div>
                        <Icon name='camera' />
                        {niceTime(page.timestamp)}
                    </div>
                    {isStoredInternally(page) && <SaveAsButton className={styles.showOnHover} page={page} />}
                    <DeleteButton
                        page={page}
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
