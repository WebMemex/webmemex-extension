import React from 'react'
import PropTypes from 'prop-types'
import { Radio, Icon, Button } from 'semantic-ui-react'

import { downloadAllPages } from 'src/local-storage'

import { getSettings, setSettings } from '.'

export default class Main extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        this.loadSettings = this.loadSettings.bind(this)
        this.saveAllPages = this.saveAllPages.bind(this)
        this.pickStorageLocation = this.pickStorageLocation.bind(this)
    }

    componentDidMount() {
        browser.storage.onChanged.addListener(this.loadSettings)
        this.loadSettings()
    }

    componentWillUnmount() {
        browser.storage.onChanged.removeListener(this.loadSettings)
    }

    async saveAllPages() {
        await downloadAllPages()
    }

    async loadSettings() {
        const settings = await getSettings()
        this.setState({ settings })
    }

    async pickStorageLocation(event, { value }) {
        await setSettings({
            storeInDownloadFolder: value === 'downloads' || value === 'both',
            storeInternally: value === 'internal' || value === 'both',
        })
    }

    render() {
        const disableIfNotLoaded = this.state.settings ? {} : {
            disabled: true,
            // If a user has time to read this, we can assume loading has failed.
            title: "Unable to load settings from this extension’s storage.",
        }
        const { storeInDownloadFolder, storeInternally } = this.state.settings || {}
        return (
            <div>
                <h1>WebMemex extension options</h1>
                <h3>Storage location</h3>
                <p>
                    When making snapshots, save them in…
                </p>
                <ul style={{ listStyle: 'none' }}>
                    <li>
                        <Radio
                            {...disableIfNotLoaded}
                            name='storageLocation'
                            value='downloads'
                            checked={storeInDownloadFolder && !storeInternally}
                            label={(
                                <label>
                                    your downloads folder
                                    <br />
                                    <small>To access them with your file manager and to not accidentally lose them some day</small>
                                </label>
                            )}
                            onChange={this.pickStorageLocation}
                        />
                    </li>
                    <li>
                        <Radio
                            {...disableIfNotLoaded}
                            name='storageLocation'
                            value='internal'
                            checked={!storeInDownloadFolder && storeInternally}
                            label={(
                                <label>
                                    this browser extension’s internal storage
                                    <br />
                                    <small>Use this if storing in the downloads folder does not work well for you</small>
                                </label>
                            )}
                            onChange={this.pickStorageLocation}
                        />
                    </li>
                    <li>
                        <Radio
                            {...disableIfNotLoaded}
                            name='storageLocation'
                            value='both'
                            checked={storeInDownloadFolder && storeInternally}
                            label={(
                                <label>
                                    both
                                    <br />
                                    <small>Note this takes twice the storage space</small>
                                </label>
                            )}
                            onChange={this.pickStorageLocation}
                        />
                    </li>
                </ul>
                <h3>Export</h3>
                <p>
                    Of your <b>{this.props.numberOfSnapshots}</b> snapshots in total, <b>{this.props.numberOfSnapshotsStoredInsideExtension}</b> are stored inside this
                    extension (together about <b>{this.props.totalSnapshotSizeInsideExtensionInMB} MB</b>).
                </p>
                <p>
                    <Button
                        onClick={this.saveAllPages}
                        title={`Copy the ${this.props.numberOfSnapshotsStoredInsideExtension} snapshots that are stored in this extension into your downloads folder`}
                        disabled={this.props.numberOfSnapshotsStoredInsideExtension === 0}
                    >
                        <Icon name='save' />
                        Save these {this.props.numberOfSnapshotsStoredInsideExtension} snapshots in the downloads folder
                    </Button>
                </p>
            </div>
        )
    }
}

Main.propTypes = {
    numberOfSnapshots: PropTypes.number,
    numberOfSnapshotsStoredInsideExtension: PropTypes.number,
    totalSnapshotSizeInsideExtensionInMB: PropTypes.number,
}
