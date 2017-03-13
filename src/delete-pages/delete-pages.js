import db from '../pouchdb'
import { findPagesByUrl, updatePageSearchIndex } from '../search/find-pages'

const defaultResultLimit = 30

//Delete all Page entries returned by findPagesByUrl
function deletePageEntries(pagesResult) {
  console.log(pagesResult);
  const pages = pagesResult.rows.map(row => ({
    id: row.doc._id,
    rev: row.doc_rev
  }));
  for (var key in pages) {
    db.get(pages[key].id).then(doc => db.remove(doc._id, doc._rev)).then(() => {
      console.timeEnd('Deleting pages end')
      console.time('rebuild search index')
      return updatePageSearchIndex()
    }).then(() => {
      console.timeEnd('rebuild search index')
    }).catch(err => console.log(err));
  }
}

export default function deletePage(query) {
  console.log(query)
  var result = findPagesByUrl({query, limit: defaultResultLimit}).then(
    deletePageEntries
  )
}
