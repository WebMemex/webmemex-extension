import iface from 'jsdom/lib/jsdom/living/generated/Element'

Element.prototype.insertAdjacentElement = function insertAdjacentElement(position, node) {
    position = position.toLowerCase();

    let context;
    switch (position) {
        case "beforebegin":
        case "afterend": {
            context = this.parentNode;
            if (context === null || context.nodeType === NODE_TYPE.DOCUMENT_NODE) {
              throw new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR, "Cannot insert HTML adjacent to " +
                "parent-less nodes or children of document nodes.");
            }
            break;
        }
        case "afterbegin":
        case "beforeend": {
            context = this;
            break;
        }
        default: {
            throw new DOMException(DOMException.SYNTAX_ERR, "Must provide one of \"beforebegin\", \"afterend\", " +"\"afterbegin\", or \"beforeend\".");
        }
    }

    // TODO: use context for parsing instead of a <template>.
    const fragment = this.ownerDocument.createElement("template");
    fragment.innerHTML = node.outerHTML;

    switch (position) {
        case "beforebegin": {
            this.parentNode.insertBefore(fragment.content, this);
            break;
        }
        case "afterbegin": {
            this.insertBefore(fragment.content, this.firstChild);
            break;
        }
        case "beforeend": {
            this.appendChild(fragment.content);
            break;
        }
        case "afterend": {
            this.parentNode.insertBefore(fragment.content, this.nextSibling);
            break;
        }
    }
}

global.fetch = require('jest-fetch-mock')
