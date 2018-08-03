import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import configureStore from './store'
import overview from './overview-ui'

import './base.css'

// DEBUG expose for manual making dumps, while not supported by GUI.
import { downloadAllPages } from 'src/page-storage'
window.downloadAllPages = downloadAllPages

// Include development tools if we are not building for production
let ReduxDevTools
if (process.env.NODE_ENV !== 'production') {
    ReduxDevTools = require('src/dev/redux-devtools-component').default
}

// Set up the Redux store
const store = configureStore({ ReduxDevTools })

store.dispatch(overview.actions.init())

// Render the UI to the screen
ReactDOM.render(
    <Provider store={store}>
        <div>
            <overview.components.Overview grabFocusOnMount />
            {ReduxDevTools && <ReduxDevTools />}
        </div>
    </Provider>,
    document.getElementById('app')
)
