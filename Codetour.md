# Code tour

A quick introduction to the folders and files in this repo.

## WebExtension anatomy

To comply with the [anatomy of a WebExtension](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Anatomy_of_a_WebExtension),
this extension consists of the following parts (found in [`extension/`](extension/) after building):

- The background script (`main/background/index.js`) always runs, in an 'empty invisible tab',
  listening for messages and events.
- The content script (`main/content_script/index.js`) is loaded into every web page that is
  visited. It is invisible from that web page's own scripts, and can talk to the background script.
- The `html` files, with their resources in corresponding folders, provide the user interface.

The parts communicate in two ways:
- through remote procedure calls using [`webextension-rpc`](https://www.npmjs.com/package/webextension-rpc), which is a simple abstraction
  around `browser.sendMessage`.
- Through the in-browser [PouchDB](https://pouchdb.com/) database, they get to see the same data,
  and can react to changes made by other parts.

## Source organisation

### [`src/main/`](src/main/)

The glue between things. Contains the main background script and content script, and configures
the high level behaviour of menu options and keyboard shortcuts.

### [`src/page-capture/`](src/page-capture/): webpage capturing & extraction

This extracts and stores information about the page in a given tab, such as:
- A full html version of the rendered page, including images and other subresources, by
  [freeze-dry](https://github.com/WebMemex/freeze-dry/)ing it.
- The plain text of the page, for the full-text search.
- Metadata, such as its author, title, etcetera.
- A screenshot and the site's favicon.

Part of the code for these features are run in the background script, part is performed in the
content script running inside the tab.

### [`src/local-storage/`](src/local-storage/): (web)page storage

Everything related to managing the pages stored in the database.

### [`src/local-page/`](src/local-page/) + [`src/local-page.html`](src/local-page.html): display stored pages

Code for displaying the locally stored web pages, making them accessible on their own URL.

### [`src/overview/`](src/overview/) + [`src/overview.html`](src/overview.html): overview

The overview is the user interface that opens in a tab of its own. See
[`src/overview/Readme.md`](src/overview/Readme.md) for more details.

### [`src/popup/`](src/popup/) + [`src/popup.html`](src/popup.html): browser button popup

The UI that shows up when pressing the extension's toolbar (‘browser_action’) button.

### [`src/options/`](src/options/) + [`src/options.html`](src/options.html): extension settings page

The UI that shows when opening the extension’s preferences.

### [`src/dev/`](src/dev/): development tools

Tools to help during development. They are not used in production builds.

### [`src/util/`](src/util/): utilities

Small generic things, that could perhaps be published as an independent module some day.

### `...`: other stuff

The build process is a `Makefile`, that runs some `npm` commands specified in `package.json`, which
in turn start the corresponding tasks in `gulpfile.babel.js` (transpiled by settings in `.babelrc`).
All lurking there so you only have to type `make` to get things running.

And a bunch of other development tool configurations, the usual cruft.

So much for the code tour. :zzz:  Any questions? :point_up:
