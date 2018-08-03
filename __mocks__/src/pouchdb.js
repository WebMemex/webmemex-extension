import PouchDB from 'pouchdb-core'
import PouchDBFind from 'pouchdb-find'

import PouchDBMemory from 'pouchdb-adapter-memory'

PouchDB
  .plugin(PouchDBMemory)
  .plugin(PouchDBFind)

const pouchdbOptions = {
    name: 'testdb',
    auto_compaction: true,
    adapter: 'memory',
}

const db = PouchDB(pouchdbOptions)
export default db
