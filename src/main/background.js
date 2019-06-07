import { makeRemotelyCallable } from 'src/util/webextensionRPC'
import { downloadPage } from 'src/local-storage'

import './background/menus-and-shortcuts'
import './background/trigger-capture'
import './background/snapshot-linked-pages'
import './background/snapshot-tab'

makeRemotelyCallable({
    downloadPage,
})
