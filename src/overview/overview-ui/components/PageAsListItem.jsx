import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Icon } from 'semantic-ui-react'
import classNames from 'classnames'

import { relativeUrlForLocalPage } from 'src/local-page'
import niceTime from 'src/util/nice-time'
import shortUrl from 'src/util/short-url'
import { DeleteButton, SaveAsButton } from 'src/common-components'

import ImgFromPouch from './ImgFromPouch'
import styles from './PageAsListItem.css'
import { deletePage as deletePageAction } from '../actions'

const PageAsListItem = ({ doc, dispatchDeletePage }) => {
    const href = relativeUrlForLocalPage(doc)

    const classes = classNames({
        [styles.root]: true,
        [styles.available]: !!href,
    })

    const hasFavIcon = !!(doc._attachments && doc._attachments.favIcon)
    const favIcon = hasFavIcon
        ? (
            <ImgFromPouch
                className={styles.favIcon}
                doc={doc}
                attachmentId='favIcon'
            />
        )
        : <Icon size='big' name='file outline' className={styles.favIcon} />

    return (
        <div className={classes}>
            <a
                className={styles.card}
                href={href}
                title={href ? undefined : `Page not available. Perhaps storing failed?`}
                // DEBUG Show document props on ctrl+meta+click
                onClick={e => { if (e.metaKey && e.ctrlKey) { console.log(doc); e.preventDefault() } }}
                onKeyPress={e => {
                    if (
                        e.key==='Delete'
                        && confirm(`Delete this snapshot of '${shortUrl(doc.url)}'?`)
                    ) {
                        dispatchDeletePage()
                    }
                }}
            >
                <div className={styles.screenshotContainer}>
                    {doc._attachments && doc._attachments.screenshot
                        ? (
                            <ImgFromPouch
                                className={styles.screenshot}
                                doc={doc}
                                attachmentId='screenshot'
                            />
                        )
                        : favIcon
                    }
                </div>
                <div className={styles.title}>
                    {hasFavIcon && favIcon}
                    <span title={doc.title}>
                        {doc.title}
                    </span>
                </div>
            </a>
            <div className={styles.url}>
                Snapshot of
                <a
                    href={doc.url}
                    title={doc.url}
                >
                    {shortUrl(doc.url)}
                </a>
            </div>
            <div className={styles.time}>made {niceTime(doc.timestamp)}</div>
            <div className={styles.buttonsContainer}>
                <SaveAsButton page={doc} />
                <DeleteButton page={doc} onClick={dispatchDeletePage} tabIndex='-1' />
            </div>
        </div>
    )
}

PageAsListItem.propTypes = {
    doc: PropTypes.object.isRequired,
    dispatchDeletePage: PropTypes.func,
}


const mapStateToProps = state => ({})

const mapDispatchToProps = (dispatch, { doc }) => ({
    dispatchDeletePage: () => dispatch(deletePageAction({ page: doc })),
})

export default connect(mapStateToProps, mapDispatchToProps)(PageAsListItem)
