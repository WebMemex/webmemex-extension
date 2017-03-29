import { getMetadata, metadataRules } from 'page-metadata-parser'
import extractPdfMetaData from 'src/pdf-analysis/extract-pdf-metadata'

// Extract info from all sorts of meta tags (og, twitter, etc.)
export default function extractPageMetadata({
    doc = document,
    url = window.location.href,
}={}) {

    if(url.substr(url.lastIndexOf('.')+1) === "pdf" ){
        return extractPdfMetaData(url).then(function (pdfMetaData) {
            return pdfMetaData;
        })
    }

    const pageMetadata = getMetadata(doc, url, metadataRules)
    return pageMetadata
}
