import React from 'react'
import PropTypes from 'prop-types'
import { Button, Icon } from 'semantic-ui-react'

import { remoteFunction } from 'src/util/webextensionRPC'

const downloadPage = remoteFunction('downloadPage')

const SaveAsButton = ({ page, label = false, ...otherProps }) => (
    <Button
        icon
        size='medium'
        compact
        onClick={event => {
            event.preventDefault()
            event.stopPropagation()
            downloadPage({ page, saveAs: true })
        }}
        title='Save snapshot to floppy disk…'
        {...otherProps}
    >
        <Icon name='save' />
        {label && ' Save as…'}
    </Button>
)

SaveAsButton.propTypes = {
    page: PropTypes.object.isRequired,
    label: PropTypes.bool,
}

export default SaveAsButton
