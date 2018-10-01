import React from 'react'
import PropTypes from 'prop-types'
import { Popup, Button, Icon } from 'semantic-ui-react'

// onClick is passed as prop, as its implementation differs a bit between overview, popup, etc.
const DeleteButton = ({ onClick, label, ...otherProps }) => (
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
    onClick: PropTypes.func.isRequired,
    label: PropTypes.bool,
}

export default DeleteButton
