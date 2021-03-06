import get from 'lodash/fp/get'
import omit from 'lodash/fp/omit'
import React from 'react'
import PropTypes from 'prop-types'
import { blobToDataURL } from 'blob-util'

import db from 'src/pouchdb'


const readHash = ({ doc, attachmentId }) =>
    doc && attachmentId && get(['_attachments', attachmentId, 'digest'])(doc)

export default class ImgFromPouch extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataUrl: undefined,
        }
    }

    componentDidMount() {
        // Fetch the attachment.
        this._isMounted = true
        this.updateFile()
    }

    componentDidUpdate(prevProps) {
        // If the attachment has changed, rerun the update
        if (readHash(prevProps) !== readHash(this.props)) {
            this.updateFile()
        }
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    async updateFile() {
        const { doc, attachmentId } = this.props

        let blob
        try {
            blob = await db.getAttachment(doc._id, attachmentId)
        } catch (err) {}

        const dataUrl = blob ? await blobToDataURL(blob) : undefined

        if (this._isMounted) {
            this.setState({ dataUrl })
        }
    }

    render() {
        const childProps = omit(Object.keys(this.constructor.propTypes))(this.props)
        return (
            <img
                {...childProps}
                src={this.state.dataUrl}
            />
        )
    }
}

ImgFromPouch.propTypes = {
    doc: PropTypes.object,
    attachmentId: PropTypes.string,
}
