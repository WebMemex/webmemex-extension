import React from 'react'
import PropTypes from 'prop-types'

import LinkToSnapshot from 'src/common-components/LinkToSnapshot'

import LinkOpenInTab from './LinkOpenInTab'

const LinkToSnapshotOpenInTab = props => (
    <LinkToSnapshot
        as={LinkOpenInTab}
        {...props}
    />
)

LinkToSnapshotOpenInTab.propTypes = {
    ...LinkToSnapshot.propTypes,
    tabId: PropTypes.number,
}

export default LinkToSnapshotOpenInTab
