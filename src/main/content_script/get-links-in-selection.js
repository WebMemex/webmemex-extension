import { makeRemotelyCallable } from 'src/util/webextensionRPC'

async function getLinksInSelection() {
    // Get all <a> and <area> elements in the user's current selection.
    const selection = window.getSelection()
    const range = selection.getRangeAt(0)
    const documentFragment = range.cloneContents()
    const linkElements = Array.from(documentFragment.querySelectorAll('a[href], area[href]'))

    // Get the URLs these elements link to.
    const urls = linkElements
        .map(element => element.href.split('#')[0]) // get href, drop fragment identifiers
        .filter((element, index, array) => array.indexOf(element) === index) // remove duplicates
        // .filter(url => url !== document.URL.split('#')[0]) // filter links to itself (desirable?)
    return urls
}

makeRemotelyCallable({ getLinksInSelection })
