import React from 'react'
import PropTypes from 'prop-types'
import { Popup, Button, Icon } from 'semantic-ui-react'

import { isStoredInDownloads, isStoredInternally } from 'src/local-page'

// onClick is passed as prop, as its implementation differs a bit between overview, popup, etc.
const DeleteButton = ({ page, onClick, label, ...otherProps }) => (
    <Popup
        trigger={
            <Button
                icon
                size='medium'
                compact
                onClick={async event => {
                    event.preventDefault()
                    event.stopPropagation()
                }}
                title='Delete this snapshot'
                {...otherProps}
            >
                <Icon name='trash' />
                {label && ' Delete'}
            </Button>
        }
        content={
            <Button
                negative
                content='Delete this snapshot'
                title={isStoredInDownloads(page) && isStoredInternally(page) ? 'Delete this snapshot both from this extension’s storage and your downloads folder' : undefined}
                onClick={event => {
                    event.preventDefault()
                    event.stopPropagation()
                    onClick()
                }}
            />
        }
        on='focus'
        hoverable
        position='bottom center'
    />
)

DeleteButton.propTypes = {
    page: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    label: PropTypes.bool,
}

export default DeleteButton
