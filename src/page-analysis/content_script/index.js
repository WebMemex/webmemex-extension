import freezeDry from 'freeze-dry'

import { makeRemotelyCallable } from 'src/util/webextensionRPC'
import { extractPageContent } from './extract-page-content'

makeRemotelyCallable({
    extractPageContent,
    freezeDry,
})
