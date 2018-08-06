# WebMemex browser extension

This browser extension aspires to turn the browser into an offline-first knowledge management tool.
It can store web pages you visit on your computer by 'freeze-drying' them: removing scripts and thus
most interactive behaviour, but inlining all images and stylesheets to let you save the page exactly
the way you saw it.

Future steps will be to enable you to extract quotes, create notes, and make links between things,
to really grow your personal web. Ultimately, you should be able to publish (parts of) your web to
share your knowledge with others, thus turning your browser from a *web viewer* into a *web weaver*.

It is currently tested and published for [Firefox][] and [Chromium/Chrome][].


[Firefox]: https://addons.mozilla.org/en-US/firefox/addon/webmemex/
[Chromium/Chrome]: https://chrome.google.com/webstore/detail/webmemex/dmkhpphjjbjgalkmaolgngobjlmfggfg


## Contribute

Got feedback, bug fixes, new features, tips? Want to help with coding, design, or communication?
Give a shout. 📢

Pop in on #webmemex on [Freenode][], send a PR or open an issue on the [GitHub repo][], or send me
([Gerben/Treora][Treora]) a message.

All code in this project is in the public domain, free from copyright restrictions. Please waive
your copyrights on any contributions you make. See e.g. [unlicense.org][] for more information.


[Freenode]: http://webchat.freenode.net/
[GitHub repo]: https://github.com/WebMemex/webmemex-extension
[Treora]: https://github.com/Treora
[unlicense.org]: https://unlicense.org/


## Hacking

See [`Codetour.md`](Codetour.md) for an explanation of the repository structure. In short, it is a
[WebExtension][] (runs on Firefox and Chrome/Chromium browsers), bundled by [browserify][] with some
[babel][] ES6–7→ES5 compilation, that logs and stores pages in [PouchDB][], and provides a viewer
for this personal web based on [React][]+[Redux][].

### Build and run it

1. Clone this repo.
2. Get [Node/NPM][]≥7.
3. Run `make` to install dependencies and compile the source files.
4. Load it in Firefox or Chromium/Chrome:
    * In Firefox (≥49): run `npm run firefox` (or run [web-ext][] directly for more control).
      Alternatively, go to `about:debugging`, choose 'Load Temporary Add-on', and pick
      `extension/manifest.json` from this repo.
    * In Chromium/Chrome: go to Tools→Extensions (`chrome://extensions`), enable 'Developer mode',
      click 'Load unpacked extension...', and pick the `extension/` folder from this repo.

### Automatic recompilation

If the steps above worked, running `npm run watch` will trigger a quick recompilation every time a
source file has been modified.

If you are testing in Firefox through `npm run firefox`/`web-ext`, the extension should also reload
automatically. Otherwise, manually press the reload button in the extension list.


[WebExtension]: https://developer.mozilla.org/en-US/Add-ons/WebExtensions
[browserify]: http://browserify.org/
[babel]: https://babeljs.io/
[PouchDB]: https://pouchdb.com/
[React]: https://facebook.github.io/react/
[Redux]: http://redux.js.org/
[Node/NPM]: https://nodejs.org/
[web-ext]: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/web-ext_command_reference#web-ext_run
