import React from 'react'
import PropTypes from 'prop-types'

export default class LinkOpenInTab extends React.Component {
    constructor(props) {
        super(props)
        this.onClick = this.onClick.bind(this)
    }

    async onClick(event) {
        const { href, tabId } = this.props
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            browser.tabs.create({ url: href })
        } else if (event.shiftKey) {
            browser.window.create({ url: href })
        } else {
            browser.tabs.update(tabId, { url: href })
        }
        event.preventDefault()
    }

    render() {
        const { href, tabId, children, ...otherProps } = this.props

        return (
            <a
                {...otherProps}
                href={href}
                onClick={this.onClick}
                target='_blank' // fallback, just in case
                rel='noopener noreferrer'
            >
                {children}
            </a>
        )
    }
}

LinkOpenInTab.propTypes = {
    href: PropTypes.string,
    tabId: PropTypes.number, // if tabId is undefined, it seems to open in the current tab.
    children: PropTypes.node,
}
