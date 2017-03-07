import db from '../pouchdb'
import { updatePageSearchIndex } from '../search/find-pages'
import { getVisitItemsForHistoryItems, transformToPageDoc, transformToVisitDoc,
   convertHistoryToPagesAndVisits } from '../browser-history/import-history'
import { isWorthRemembering, generatePageDocId, generateVisitDocId,
  visitKeyPrefix, convertVisitDocId } from '../activity-logger'

    function onRejected(error) {
      console.log(`An error: ${error}`);
    }

    function getBookmarkItems() {
      var bookmarkTree = browser.bookmarks.getRecent(100000);
      return bookmarkTree.then(bookmarkItems =>
          bookmarkItems.filter(({url}) => isWorthRemembering({url})));
    }

    export default function importBookmarks() {
      return getBookmarkItems().then(result =>
      getVisitItemsForHistoryItems(result)).then(
          res => {
            var docs = convertHistoryToPagesAndVisits(res)
            let allDocs = docs.pageDocs.concat(docs.visitDocs)
            // Mark each doc to remember it originated from this import action.
            const importTimestamp = new Date().getTime()
            allDocs = allDocs.map(doc => ({
              ...doc,
              importedFromBrowserBookmarks: importTimestamp,
            }))
            // Store them into the database. Already existing docs will simply be
            // rejected, because their id (timestamp & bookmark id) already exists.
            return db.bulkDocs(allDocs)
          }
        ).then(() => {
          console.timeEnd('importing bookmarks end')
          console.time('rebuild search index')
          return updatePageSearchIndex()
        }).then(() => {
          console.timeEnd('rebuild search index')
        })
    }
