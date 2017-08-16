import fromPairs from 'lodash/fp/fromPairs'
import PouchDB from 'pouchdb-core'

import PouchDBMemory from 'pouchdb-adapter-memory'
import PouchDBFind from 'pouchdb-find'
import mapreduce from 'pouchdb-mapreduce'
import replication from 'pouchdb-replication'

PouchDB
  .plugin(PouchDBMemory)
  .plugin(PouchDBFind)
  .plugin(mapreduce)
  .plugin(replication)

const pouchdbOptions = {
    name: 'testdb',
    auto_compaction: true,
    adapter: 'memory',
}

const db = PouchDB(pouchdbOptions)
export default db

export const keyRangeForPrefix = prefix => ({
    startkey: `${prefix}`,
    endkey: `${prefix}\uffff`,
})

// Present db.find results in the same structure as other PouchDB results.
export const normaliseFindResult = result => ({
    rows: result.docs.map(doc => ({
        doc,
        id: doc._id,
        key: doc._id,
        value: {rev: doc._rev},
    })),
})

// Get rows of a query result indexed by doc id, as an {id: row} object.
export const resultRowsById = result =>
    fromPairs(result.rows.map(row => [row.id, row]))