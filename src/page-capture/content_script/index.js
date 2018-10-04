import freezeDry from 'freeze-dry'

import { makeRemotelyCallable } from 'src/util/webextensionRPC'
import { extractPageContent } from './extract-page-content'

function canRunFreezeDry() {
    // The primary question is whether it is possible to communicate with this content script, so we
    // can simply return true now.
    return true
}

makeRemotelyCallable({
    extractPageContent,
    freezeDry,
    canRunFreezeDry,
})
