/* eslint-env jest */
/* eslint import/namespace: "off" */

import extractPageContent from 'src/page-analysis/content_script/extract-page-content'
import * as extractPdfContent from 'src/page-analysis/content_script/extract-pdf-content'

describe('extractPageContent tests', () => {
    test('should call extractPdfContent if the url ends with .pdf', async () => {
        extractPdfContent.default = jest.fn()
        await extractPageContent({url: 'https://example.com/guide.pdf'})
        expect(extractPdfContent.default).toHaveBeenCalledWith({url: 'https://example.com/guide.pdf'})
    })

    test('should call extractPageText if the url does not end with .pdf', async () => {
        const url = 'https://example.com'
        const doc = window.document.implementation.createHTMLDocument()
        doc.body.innerText = 'Dummy Text'
        const data = await extractPageContent({url, doc})
        expect(data.fullText).toBe('Dummy Text')
    })

    test('should return the metadata of the document', async () => {
        expect.assertions(4)
        const url = 'https://example.com'
        const parser = new DOMParser()
        const doc = parser.parseFromString(
            '<html><head><meta name="description" content="example"><meta name="keywords" content="Test"><link rel="canonical" href="https://example.com/"/><title>Example</title></head><body>Dummy Text</body></html>',
            'text/html'
        )
        const data = await extractPageContent({url, doc})
        expect(data.canonicalUrl).toBe('https://example.com/')
        expect(data.description).toBe('example')
        expect(data.title).toBe('Example')
        expect(data.keywords[0]).toBe('Test')
    })
})
