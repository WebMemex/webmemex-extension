import { makeRemotelyCallable } from 'src/util/webextensionRPC'

async function getLinksInSelection() {
    // Get all <a> and <area> elements in the user's current selection.
    const linkSelectors = 'a[href], area[href]'
    const selection = window.getSelection()
    let linkElements = []
    for (let i = 0; i < selection.rangeCount; i++) {
        const range = selection.getRangeAt(i)
        const documentFragment = range.cloneContents()
        const linkElementsInFragment = Array.from(documentFragment.querySelectorAll(linkSelectors))
        linkElements = linkElements.concat(linkElementsInFragment)
    }

    // Get the URLs these elements link to.
    const urls = linkElements
        .map(element => element.href.split('#')[0]) // get href, drop fragment identifiers
        .filter((element, index, array) => array.indexOf(element) === index) // remove duplicates
        // .filter(url => url !== document.URL.split('#')[0]) // filter links to itself (desirable?)
    return urls
}

makeRemotelyCallable({ getLinksInSelection })
