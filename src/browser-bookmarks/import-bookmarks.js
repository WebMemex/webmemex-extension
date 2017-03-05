import db from '../pouchdb'
import { updatePageSearchIndex } from '../search/find-pages'
import { isWorthRemembering, generatePageDocId, generateVisitDocId,
  visitKeyPrefix, convertVisitDocId } from '../activity-logger'

  function makeIndent(indentLength) {
    return ".".repeat(indentLength);
  }

  function getVisitItemsForBookmarkItems(bookmarkItems) {
    console.log("first element" + bookmarkItems[0].url);
    const promises = bookmarkItems.map(bookmarkItem =>
      browser.history.getVisits({
        url: bookmarkItem.url,
      }).then(
        visitItems => ({bookmarkItem, visitItems})
      )
    )
    //console.log(promises);
    return Promise.all(promises)
  }

  function transformToPageDoc({bookmarkItem, visitItems}) {
    const pageDoc = {
      _id: generatePageDocId({
        timestamp: visitItems[0],
        nonce: `bookmark-${bookmarkItem.id}`,
      }),
      url: bookmarkItem.url,
      title: bookmarkItem.title,
    }
    return pageDoc
  }

  function transformToVisitDoc({visitItem, pageDoc}) {
    return {
      _id: generateVisitDocId({
        timestamp: visitItem.visitTime,
        // We set the nonce manually, to prevent duplicating items if
        // importing multiple times (thus making importBookmarks idempotent).
        nonce: `history-${visitItem.visitId}`,
      }),
      visitStart: visitItem.visitTime,
      // Temporarily keep the pointer to the browser history's id numbering.
      // Will be replaced by the id of the corresponding visit in our model.
      referringVisitItemId: visitItem.referringVisitId,
      url: pageDoc.url,
      page: {
        _id: pageDoc._id,
      },
    }
  }

  // Convert the array of {bookmarkItems, visitItems} pairs to our model.
  // Returns two arrays: pageDocs and visitDocs.
  function convertBookmarksToPagesAndVisits(allBookmarks) {
    console.log("inside convert to pages");
    console.log(allBookmarks);
    const pageDocs = []
    const visitDocs = {}
    allBookmarks.forEach(({bookmarkItem, visitItems}) => {
      // Map each pair to a page..
      console.log("visitItems" + visitItems);
      const pageDoc = transformToPageDoc({bookmarkItem, visitItems})
      console.log("pagedoc" + pageDoc.title);
      pageDocs.push(pageDoc)
      // ...and one or more visits to that page.
      visitItems.forEach(visitItem => {
        const visitDoc = transformToVisitDoc({visitItem, pageDoc})
        console.log("visitDoc" + visitDoc)
        visitDocs[visitItem.visitId] = visitDoc
      })
    })
    // Now each new visit has an id, we can map the referrer-paths between them.
    Object.values(visitDocs).forEach(visitDoc => {
      // Take and forget the id of the visitItem in the browser's history.
      const referringVisitItemId = visitDoc.referringVisitItemId
      delete visitDoc.referringVisitItemId
      if (referringVisitItemId && referringVisitItemId !== '0') {
        // Look up what visit this id maps to in our model.
        const referringVisitDoc = visitDocs[referringVisitItemId]
        if (referringVisitDoc) {
          const referringVisitDocId = referringVisitDoc._id
          // Add a reference to the visit document.
          visitDoc.referringVisit = {_id: referringVisitDocId}
        }
        else {
          // Apparently the referring visit is not present in the history.
          // We can just pretend that there was no referrer.
        }
      }
    })
    // Return the new docs.
    return {
      pageDocs,
      visitDocs: Object.values(visitDocs) // we can forget the old ids now
    }
  }

  function logtree(bookmarkResult, indent) {
    const bookmarkItems =[]
    for ( var key in bookmarkResult) {
      if (bookmarkResult[key].url) {
        console.log("The value key is " + key);
        console.log("The value of bookmark[key] is " + bookmarkResult[key].url)
        //console.log(makeIndent(indent) + bookmarkResult[key].url);
        bookmarkItems.push(isWorthRemembering(bookmarkResult[key].url));
      }
      else if (bookmarkResult[key].children) {
        for (child of bookmarkResult[key].children) {
          bookmarkItems.push(isWorthRemembering(child.url))
        }
      }
      else {
        console.log(makeIndent(indent) + "Folder");
        indent++;
      }
    }
    return bookmarkItems;
  }

  function onRejected(error) {
    console.log(`An error: ${error}`);
  }

  function getBookmarkItems() {
    var bookmarkTree = browser.bookmarks.getRecent(5);
    console.log("inside getBookmarkItems");
    return bookmarkTree.then(result => logtree(result, 0), onRejected);
  }

  export default function importBookmarks() {
    return getBookmarkItems().then(result => console.log("returned array " + result[0].url)).then(
      // Convert everything to our data model
      convertBookmarksToPagesAndVisits
    ).then(({pageDocs, visitDocs}) => {
      // Mark and store the pages and visits.
      let allDocs = pageDocs.concat(visitDocs)
      // Mark each doc to remember it originated from this import action.
      const importTimestamp = new Date().getTime()
      allDocs = allDocs.map(doc => ({
        ...doc,
        importedFromBrowserBookmarks: importTimestamp,
      }))
      // Store them into the database. Already existing docs will simply be
      // rejected, because their id (timestamp & bookmark id) already exists.
      return db.bulkDocs(allDocs)
    }).then(() => {
      console.timeEnd('importing bookmarks end')
      console.time('rebuild search index')
      return updatePageSearchIndex()
    }).then(() => {
      console.timeEnd('rebuild search index')
    })
  }
