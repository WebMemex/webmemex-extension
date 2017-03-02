import assocPath from 'lodash/fp/assocPath'

import { remoteFunction } from '../../util/webextensionRPC'
import whenAllSettled from '../../util/when-all-settled'
import db from '../../pouchdb'
import { updatePageSearchIndex } from '../../search/find-pages'

import getFavIcon from './get-fav-icon'
import makeScreenshot from './make-screenshot'

// Extract interesting stuff from the current pdf document and store it.
export default function performPdfAnalysis({pageId, tabId}) {

	const extractPdfText = remoteFunction('extractPdfText', {tabId})
    const extractPdfMetadata = remoteFunction('extractPdfMetadata', {tabId})

	// A shorthand for updating a single field in a doc.
	const setDocField = (db, docId, key) =>
	    value => db.upsert(docId, doc => assocPath(key, value)(doc))

	// Get page title, author (if any), etcetera.
	const storePdfMetadata = extractPdfMetadata().then(
	    setDocField(db, pageId, 'extractedMetadata')
	)

	// Get and store the fav-icon
	const storeFavIcon = getFavIcon({tabId}).then(
	    setDocField(db, pageId, 'favIcon')
	)

	// Capture a screenshot.
	const storeScreenshot = makeScreenshot({tabId}).then(
	    setDocField(db, pageId, 'screenshot')
	).catch(
	    err => console.error(err)
	)

	// Extract the main text
	const storePdfText = extractPdfText().then(
	    setDocField(db, pageId, 'extractedText')
	)

	return whenAllSettled([
	    storePdfMetadata,
	    storePdfText,
	    storeFavIcon,
	    storeScreenshot,
	], {
	    onRejection: err => console.error(err)
	}).then(
	    // Update search index
	    () => updatePageSearchIndex()
	)
}
