import debounce from 'lodash/fp/debounce'
import fromPairs from 'lodash/fp/fromPairs'
import escapeHtml from 'lodash/fp/escape'

import { filterPagesByQuery } from 'src/page-storage'
import { hrefForLocalPage } from 'src/local-page'
import niceTime from 'src/util/nice-time'


// Read which browser we are running in.
let browserName
;(async () => {
    // XXX Firefox seems the only one currently implementing this function, but
    // luckily that is enough for our current needs.
    if (browser.runtime.getBrowserInfo !== undefined) {
        const browserInfo = await browser.runtime.getBrowserInfo()
        browserName = browserInfo.name
    }
})()

const pageToSuggestion = doc => {
    const pageDate = escapeHtml(niceTime(doc.timestamp))
    const url = escapeHtml(doc.url)
    const title = escapeHtml(doc.title)
    const plainDescription = `⌚ ${pageDate}  —  ${title}  —  ${url}`
    const markedUpDescription
        = `⌚ <dim>${pageDate}</dim>    —    ${title}  —  <url>${url}</url>`
    // Firefox interprets the description as plain text, so we distinguish here.
    const description = (browserName === 'Firefox')
        ? plainDescription
        : markedUpDescription
    return ({
        content: plainDescription,
        description,
    })
}

let suggestionToUrl = {}
let currentQuery
let latestResolvedQuery
async function makeSuggestion(query, suggest) {
    currentQuery = query

    // Show no suggestions if there is no query.
    if (query.trim() === '') {
        browser.omnibox.setDefaultSuggestion({
            description: 'Type to search your memory.',
        })
        suggest([])
        latestResolvedQuery = query
        return
    }

    browser.omnibox.setDefaultSuggestion({
        description: 'Searching your memory.. (press enter to search deeper)',
    })

    const queryForOldSuggestions = latestResolvedQuery

    const pagesResult = await filterPagesByQuery({ query, limit: 5 })
    const pageDocs = pagesResult.rows.map(row => row.doc)

    // A subsequent search could have already started and finished while we
    // were busy searching, so we ensure we do not overwrite its results.
    if (currentQuery !== query && latestResolvedQuery !== queryForOldSuggestions) { return }

    if (pageDocs.length === 0) {
        browser.omnibox.setDefaultSuggestion({
            description: 'No results found in your memory. (press enter to search deeper)',
        })
    } else {
        browser.omnibox.setDefaultSuggestion({
            description: `Found these ${pageDocs.length} pages in your memory: (press enter to search deeper)`,
        })
    }
    const suggestions = pageDocs.map(pageToSuggestion)

    // Call the callback function to display the suggestions to the user
    suggest(suggestions)

    // Remember which texts represent which pages, for when the user accepts a suggestion.
    // (the URLs are so ugly and random-looking we rather not show them to the user)
    suggestionToUrl = fromPairs(suggestions.map(
        (suggestion, i) => [suggestion.content, hrefForLocalPage({ page: pageDocs[i] })]
    ))

    latestResolvedQuery = query
}

const acceptInput = (text, disposition) => {
    // The user has clicked a suggestion, or pressed enter.
    let url
    if (text in suggestionToUrl) {
        // Open the page chosen from the suggestions
        url = suggestionToUrl[text]
    } else {
        // Treat input as search query, open the search
        url = `/overview.html?q=${encodeURIComponent(text)}`
    }
    // Open it in the place the browser requests us to.
    switch (disposition) {
        case 'currentTab':
            browser.tabs.update({ url })
            break
        case 'newForegroundTab':
            browser.tabs.create({ url })
            break
        case 'newBackgroundTab':
            browser.tabs.create({ url, active: false })
            break
    }
}

browser.omnibox.onInputChanged.addListener(debounce(500)(makeSuggestion))
browser.omnibox.onInputEntered.addListener(acceptInput)
