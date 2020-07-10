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
        await browser.storage.local.set({ extensionUpdate: undefined })
    }

    render() {
        if (!this.state.extensionUpdate) {
            return null
        }

        const { lastSeenVersion } = this.state.extensionUpdate

        const switchToDefaultToDownload = (semverCompare(lastSeenVersion, '0.3.4') === -1)

        if (!switchToDefaultToDownload) {
            return null
        }

        return (
            <Message info>
                <Message.Header>This extension has been updated</Message.Header>
                <Message.Content>
                    {switchToDefaultToDownload && <MessageAboutDefaultToDownload />}
                    <p>
                        For a summary of changes, see <a href='https://github.com/WebMemex/webmemex-extension/tree/master/Changelog.md'>the project’s changelog</a>.
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
