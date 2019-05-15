import React from 'react'
import PropTypes from 'prop-types'
import { Icon } from 'semantic-ui-react'

import { downloadAllPages } from 'src/local-storage'

export default class Main extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        this.saveAllPages = this.saveAllPages.bind(this)
    }

    async saveAllPages() {
        await downloadAllPages()
    }

    render() {
        return (
            <div>
                <h1>WebMemex extension options</h1>
                <p>
                    You have <b>{this.props.numberOfSnapshots}</b> snapshots stored inside this
                    extension, totalling about <b>{this.props.totalSnapshotSizeInMB} MB</b>.
                </p>
                <p>
                    <button onClick={this.saveAllPages}>
                        <Icon name='save' />
                        Save all
                    </button>
                    <label>
                        Save all your snapshots to your downloads folder
                    </label>
                </p>
            </div>
        )
    }
}

Main.propTypes = {
    numberOfSnapshots: PropTypes.number,
    totalSnapshotSizeInMB: PropTypes.number,
}
