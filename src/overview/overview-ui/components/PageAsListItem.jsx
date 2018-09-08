import get from 'lodash/fp/get'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Popup, Icon } from 'semantic-ui-react'
import classNames from 'classnames'

import { relativeUrlForLocalPage } from 'src/local-page'
import niceTime from 'src/util/nice-time'

import ImgFromPouch from './ImgFromPouch'
import styles from './PageAsListItem.css'
import { deletePage } from '../actions'


const PageAsListItem = ({ doc, onTrashButtonClick }) => {
    const href = relativeUrlForLocalPage(doc)

    const pageSize = get(['_attachments', 'frozen-page.html', 'length'])(doc)
    const sizeInMB = pageSize !== undefined
        ? Math.round(pageSize / 1024**2 * 10) / 10
        : 0

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

    const deleteButton = (
        <Popup
            trigger={
                <Button
                    icon='trash'
                    onClick={e => { e.preventDefault() }}
                    floated='right'
                    tabIndex='-1'
                />
            }
            content={
                <Button
                    negative
                    content={`Forget this item`}
                    onClick={e => { onTrashButtonClick() }}
                    title={`Stored page size: ${sizeInMB} MB`}
                />
            }
            on='focus'
            hoverable
            position='right center'
        />
    )

    return (
        <a
            href={href}
            title={href ? undefined : `Page not available. Perhaps storing failed?`}
            className={classes}
            // DEBUG Show document props on ctrl+meta+click
            onClick={e => { if (e.metaKey && e.ctrlKey) { console.log(doc); e.preventDefault() } }}
            onKeyPress={e => { if (e.key==='Delete') { onTrashButtonClick() } }}
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
            <div className={styles.descriptionContainer}>
                <div
                    className={styles.title}
                >
                    {hasFavIcon && favIcon}
                    <span title={doc.title}>
                        {doc.title}
                    </span>
                </div>
                <div className={styles.url}>
                    <a
                        href={doc.url}
                        title='Visit original location'
                    >
                        <Icon
                            name='external'
                            link
                        />
                    </a>
                    <span>{doc.url}</span>
                </div>
                <div className={styles.time}>{niceTime(doc.timestamp)}</div>
            </div>
            <div className={styles.buttonsContainer}>
                {deleteButton}
            </div>
        </a>
    )
}

PageAsListItem.propTypes = {
    doc: PropTypes.object.isRequired,
    onTrashButtonClick: PropTypes.func,
}


const mapStateToProps = state => ({})

const mapDispatchToProps = (dispatch, { doc }) => ({
    onTrashButtonClick: () => dispatch(deletePage({ page: doc })),
})

export default connect(mapStateToProps, mapDispatchToProps)(PageAsListItem)
