/* eslint-env jest */

import { extractPageContent } from './extract-page-content'

const exampleHtml = `
<html>
    <head>
        <meta name="description" content="example">
        <meta name="keywords" content="bogus, test, example">
        <link rel="canonical" href="https://example.com/"/>
        <title>Example</title>
    </head>
    <body>
        <p>
            Dummy Text
        </p>
    </body>
</html>
`

test('extractPageContent', () => {
    const url = 'https://example.com'
    const parser = new DOMParser()
    const doc = parser.parseFromString(exampleHtml, 'text/html')

    const data = extractPageContent({ url, doc })

    expect(data.canonicalUrl).toEqual('https://example.com/')
    expect(data.description).toEqual('example')
    expect(data.title).toEqual('Example')
    expect(data.keywords).toEqual(['bogus', 'test', 'example'])
    // (skipping test below, as Node.innerText is not yet implemented in JSDOM)
    // expect(data.fullText.trim()).toEqual('Dummy Text')
})
