import { makeRemotelyCallable } from 'webextension-rpc'
import { downloadPage } from 'src/local-storage'

import './background/menus-and-shortcuts'
import './background/trigger-capture'
import './background/snapshot-linked-pages'
import './background/snapshot-tab'
import './background/extension-upgrade'

makeRemotelyCallable({
    downloadPage,
})
