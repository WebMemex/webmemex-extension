// may be this js is not that useful for pdfs

import { getMetadata, metadataRules } from 'page-metadata-parser'

// Extract info from all sorts of meta tags (og, twitter, etc.)
export default function extractPdfMetadata({
    doc = document,
    url = window.location.href,
}={}) {
    const pageMetadata = getMetadata(doc, url, metadataRules)
    return pageMetadata
}