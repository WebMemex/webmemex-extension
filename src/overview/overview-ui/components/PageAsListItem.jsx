import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Icon } from 'semantic-ui-react'
import classNames from 'classnames'

import { isStoredInternally, isSnapshotAvailable } from 'src/local-page'
import niceTime from 'src/util/nice-time'
import shortUrl from 'src/util/short-url'
import { DeleteButton, SaveAsButton, LinkToSnapshot } from 'src/common-components'

import ImgFromPouch from './ImgFromPouch'
import styles from './PageAsListItem.css'
import { deletePage as deletePageAction } from '../actions'

const PageAsListItem = ({ page, dispatchDeletePage }) => {
    const classes = classNames({
        [styles.root]: true,
        [styles.available]: isSnapshotAvailable(page),
    })

    const hasFavIcon = !!(page._attachments && page._attachments.favIcon)
    const favIcon = hasFavIcon
        ? (
            <ImgFromPouch
                className={styles.favIcon}
                doc={page}
                attachmentId='favIcon'
            />
        )
        : <Icon size='big' name='file outline' className={styles.favIcon} />

    return (
        <div className={classes}>
            <LinkToSnapshot
                page={page}
                className={styles.card}
                onKeyPress={e => {
                    if (
                        e.key==='Delete'
                        && confirm(`Delete this snapshot of '${shortUrl(page.url)}'?`)
                    ) {
                        dispatchDeletePage()
                    }
                }}
            >
                <div className={styles.screenshotContainer}>
                    {page._attachments && page._attachments.screenshot
                        ? (
                            <ImgFromPouch
                                className={styles.screenshot}
                                doc={page}
                                attachmentId='screenshot'
                            />
                        )
                        : favIcon
                    }
                </div>
                <div className={styles.title}>
                    {hasFavIcon && favIcon}
                    <span title={page.title}>
                        {page.title}
                    </span>
                </div>
            </LinkToSnapshot>
            <div className={styles.url}>
                Snapshot of{' '}
                <a
                    href={page.url}
                    title={page.url}
                >
                    {shortUrl(page.url)}
                </a>
            </div>
            <div className={styles.time}>made {niceTime(page.timestamp)}</div>
            <div className={styles.buttonsContainer}>
                {isStoredInternally(page) && <SaveAsButton page={page} />}
                <DeleteButton page={page} onClick={dispatchDeletePage} tabIndex='-1' />
            </div>
        </div>
    )
}

PageAsListItem.propTypes = {
    page: PropTypes.object.isRequired,
    dispatchDeletePage: PropTypes.func,
}


const mapStateToProps = state => ({})

const mapDispatchToProps = (dispatch, { page }) => ({
    dispatchDeletePage: () => dispatch(deletePageAction({ page })),
})

export default connect(mapStateToProps, mapDispatchToProps)(PageAsListItem)
