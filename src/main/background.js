import { makeRemotelyCallable } from 'src/util/webextensionRPC'
import { downloadPage } from 'src/local-storage'

import './background/menus-and-shortcuts'
import './background/trigger-capture'

makeRemotelyCallable({
    downloadPage,
})
