import React from 'react'
import { Message, Button } from 'semantic-ui-react'
import semverCompare from 'semver-compare'

export default class ExtensionUpgradeBanner extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            extensionUpdate: undefined,
        }
        this.dismissBanner = this.dismissBanner.bind(this)
        this.readSettings = this.readSettings.bind(this)
    }

    async componentDidMount() {
        this.readSettings()
        browser.storage.onChanged.addListener(this.readSettings)
    }

    async readSettings() {
        const { extensionUpdate } = await browser.storage.local.get('extensionUpdate')
        this.setState({ extensionUpdate })
    }

    async dismissBanner() {
        await browser.storage.local.set({ extensionUpdate: null })
    }

    render() {
        if (!this.state.extensionUpdate) {
            return null
        }

        const { lastSeenVersion } = this.state.extensionUpdate
        const currentVersion = browser.runtime.getManifest().version

        const switchToDefaultToDownload = (semverCompare(lastSeenVersion, '0.4.1') === -1) // (this should have been 0.4.0, but in that version this banner was broken)

        return (
            <Message info>
                <Message.Header>This extension has been updated to v{currentVersion}</Message.Header>
                <Message.Content>
                    {switchToDefaultToDownload && <MessageAboutDefaultToDownload />}
                    <p>
                        For a summary of changes, see <a target='_blank' href={browser.runtime.getURL('/Changelog.html')}>the changelog</a>.
                    </p>
                    <p>
                        <Button onClick={this.dismissBanner}>
                            OK
                        </Button>
                    </p>
                </Message.Content>
            </Message>
        )
    }
}

const MessageAboutDefaultToDownload = () => (
    <>
        <p>
            A significant change is that new snapshots will now be stored not in this extension itself, but directly saved in your Downloads folder; this way you can access them with your file manager, and helps to not accidentally lose them some day.
        </p>
        <p>
            If you want to change this behaviour,
            <a
                href='/options.html'
                target='_blank'
                onClick={(event) => { browser.runtime.openOptionsPage(); event.preventDefault() }}
            >{' '}
                manage this extension’s preferences
            </a>.
        </p>
    </>
)
