import db from '../pouchdb'
import { findPagesByUrl, updatePageSearchIndex } from '../search/find-pages'

//Delete all Page entries returned by findPagesByUrl
function deletePageEntries(pagesResult) {
  console.log(pagesResult);
  const promises = pagesResult.rows.map(row => {
    db.remove(row.doc).then(result => console.log(result))
  })
  return Promise.all(promises);
}

export default function deletePage(query) {
  console.log(query)
  console.time('delete pages')
  var result = findPagesByUrl({query}).then(
    deletePageEntries
  ).then(() => {
          console.timeEnd('delete pages')
          console.time('rebuild search index')
          return updatePageSearchIndex()
      }).then(() => {
          console.timeEnd('rebuild search index')
      })
}
