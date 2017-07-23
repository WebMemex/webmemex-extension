import MediumEditor from 'medium-editor'

// Makes document.body editable using medium-editor. It applies some workarounds to, when reading
// the document content, ignore the widgets and other stuff added by the editor itself.
// XXX This is all very hacky. Some things should really be implemented inside medium-editor itself.
export default function makeEditable(document) {
    const stylesheets = [
        '/lib/medium-editor/medium-editor.css',
        '/lib/medium-editor/default.css',
    ]
    stylesheets.forEach(stylesheet => {
        const href = browser.runtime.getURL(stylesheet)
        const linkEl = document.createElement('link')
        linkEl.setAttribute('rel', 'stylesheet')
        linkEl.setAttribute('href', href)
        linkEl.setAttribute('data-temporary-element', true)
        document.head.insertAdjacentElement('beforeend', linkEl)
    })

    const editor = new MediumEditor(document.body, {
        contentWindow: document.defaultView,
        ownerDocument: document,
        // toolbar: { // FIXME Toolbar appears at wrong position when scrolled down.
        //     buttons: ['bold', 'italic'],
        // },
        toolbar: false,
        anchorPreview: false,
        extensions: {
            'imageDragging': { // bogus extension to replace default
                init: () => {},
            },
        },
    })

    // Return an object that behaves somewhat like MediumEditor's API.
    return {
        subscribe: editor.subscribe.bind(editor),
        destroy: editor.destroy.bind(editor),
        setup: editor.setup.bind(editor),
        getContent: () => getContent(document),
    }
}

function getContent(document) {
    // Clone the document's root element into a new (invisible) document.
    let shadowDoc = document.implementation.createHTMLDocument()
    const rootElement = shadowDoc.importNode(
        document.documentElement,
        true /* deep copy */
    )
    shadowDoc.replaceChild(rootElement, shadowDoc.documentElement)

    // Remove all elements created by us
    const elements = Array.from(shadowDoc.querySelectorAll('*[data-temporary-element]'))
    elements.forEach(element => {
        element.parentNode.removeChild(element)
    })

    // Remove stuff added by medium-editor
    removeMediumEditorStuff(shadowDoc)

    const htmlString = shadowDoc.documentElement.outerHTML
    return htmlString
}

// Hacky function to remove stuff inserted by medium-editor from the (cloned) DOM.
function removeMediumEditorStuff(document) {
    const editorElement = document.body

    // Attributes removed by medium-editor's destroy function (https://github.com/yabwe/medium-editor/blob/4ba4fff23e38240407fd170c44e8486135d3f1f0/src/js/core.js#L732-L739)
    editorElement.removeAttribute('contentEditable')
    editorElement.removeAttribute('spellcheck')
    editorElement.removeAttribute('data-medium-editor-body')
    editorElement.classList.remove('medium-editor-body')
    editorElement.removeAttribute('role')
    editorElement.removeAttribute('aria-multiline')
    editorElement.removeAttribute('medium-editor-index')
    editorElement.removeAttribute('data-medium-editor-editor-index')

    // Stuff destroyed by medium-editor extensions
    editorElement.removeAttribute('data-placeholder')
    const elementsToBeRemoved = Array.from(document.querySelectorAll([
        '.medium-editor-toolbar-form',
        '.medium-editor-toolbar',
        '.medium-editor-anchor-preview',
    ].join(', ')))
    elementsToBeRemoved.forEach(el => {
        try {
            el.parentNode.removeChild(el)
        } catch (err) {}
    })

    // Some empirically discovered remaining attributes
    editorElement.removeAttribute('data-medium-editor-element')
    editorElement.removeAttribute('data-medium-focused')
    editorElement.classList.remove('medium-editor-element')
}
