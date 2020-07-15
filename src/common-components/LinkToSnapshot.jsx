import React from 'react'
import PropTypes from 'prop-types'

import { urlForSnapshot, isStoredInDownloads } from 'src/local-page'

// This wrapper uses downloads.open() to open downloaded snapshots, because the extension may not
// be permitted to link to file:// URLs (occurs at least in Firefox 76).
export default class LinkToSnapshot extends React.Component {
    constructor(props) {
        super(props)
        this.onClick = this.onClick.bind(this)
    }

    async onClick(event) {
        const { page, onClick } = this.props
        if (onClick) {
            onClick(event)
            if (event.defaultPrevented) {
                return
            }
        }
        const href = urlForSnapshot(page)
        if (href && href.startsWith('file:') && page.download) {
            browser.downloads.open(page.download.id)
            event.preventDefault()
        }
    }

    render() {
        const { page, children, as, ...otherProps } = this.props
        const href = urlForSnapshot(page)
        const LinkElement = as || 'a'
        return (
            <LinkElement
                {...otherProps}
                href={href}
                onClick={this.onClick}
                title={href ? undefined : 'Page not available.' + (isStoredInDownloads(page) ? ' Note that if you moved/renamed the snapshot, this extension cannot access it anymore.' : '')}
            >
                {children}
            </LinkElement>
        )
    }
}

LinkToSnapshot.propTypes = {
    page: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    children: PropTypes.node,
    as: PropTypes.elementType,
}
