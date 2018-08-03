# Overview

Lists and searches through the pages the user has stored. A basic React+Redux application.
Inspiration was drawn from Jack Hsu's nice [essays][] about structuring Redux applications.
Some Redux middleware is used to deal with complexity and asynchronicity. In particular:

- [`redux-act`](https://github.com/pauldijou/redux-act) to lessen boilerplate code and simplify
  actions and reducers.
- [`redux-thunk`](https://github.com/gaearon/redux-thunk) enables actions to execute a function that
  can dispatch other actions, possibly asynchronously.
- [`redux-observable`](https://redux-observable.js.org) is used to trigger actions in response to
  other actions, e.g. running the search again when the query changed. (see [`epics.js`](epics.js))


[essays]: https://jaysoo.ca/2016/02/28/organizing-redux-application/


## Debugging

To ease debugging, the app includes [redux-devtools][] (unless it is built in production mode).
Press `Ctrl+Shift+L` in the overview to open the devtools sidebar, to see the actions and state
transitions as they happen.


[redux-devtools]: https://github.com/gaearon/redux-devtools
