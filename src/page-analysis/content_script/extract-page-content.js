import pick from 'lodash/fp/pick'
import { getMetadata, metadataRuleSets } from 'page-metadata-parser'

// Extract the text content from a web page.
export default async function extractPageContent({
    // By default, use the globals window and document.
    url = window.location.href,
    doc = document,
} = {}) {
    // Text content in web page
    const fullText = doc.body.innerText

    // Metadata of web page
    const selectedMetadataRules = {
        canonicalUrl: metadataRuleSets.url,
        title: metadataRuleSets.title,
        keywords: metadataRuleSets.keywords,
        description: metadataRuleSets.description,
    }
    const metadata = getMetadata(doc, url, selectedMetadataRules)

    return {
        fullText,
        // Picking desired fields, as getMetadata adds some unrequested stuff.
        ...pick(Object.keys(selectedMetadataRules))(metadata),
    }
}
