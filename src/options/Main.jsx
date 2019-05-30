import React from 'react'
import PropTypes from 'prop-types'
import { Checkbox, Icon } from 'semantic-ui-react'

import { downloadAllPages } from 'src/local-storage'

export default class Main extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        this.loadSettings = this.loadSettings.bind(this)
        this.saveAllPages = this.saveAllPages.bind(this)
        this.toggleDirectDownload = this.toggleDirectDownload.bind(this)
    }

    componentDidMount() {
        this.loadSettings()
        browser.storage.onChanged.addListener(this.loadSettings)
    }

    componentWillUnmount() {
        this.storage.onChanged.removeListener(this.loadSettings)
    }

    async saveAllPages() {
        await downloadAllPages()
    }

    async loadSettings() {
        // Load checkbox value from storage
        const { directDownload } = await browser.storage.local.get('directDownload')
        this.setState({ directDownload })
    }

    async toggleDirectDownload(event, { checked }) {
        await browser.storage.local.set({ directDownload: checked })
        await this.loadSettings()
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
                    <Checkbox
                        checked={this.state.directDownload}
                        label={(
                            <label>
                                When making a new snapshot, also save it to your downloads folder.
                            </label>
                        )}
                        onChange={this.toggleDirectDownload}
                    />
                </p>
                <p>
                    <button onClick={this.saveAllPages}>
                        <Icon name='save' />
                        Save all
                    </button>
                    <label>
                        Save all your existing snapshots to your downloads folder.
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
