import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import configureStore from './store'
import overview from 'src/overview'

import './base.css'

// Include development tools if we are not building for production
export const ReduxDevTools = process.env.NODE_ENV !== 'production' ?
    require('src/dev/redux-devtools').default :
    undefined

// Set up the Redux store
export const store = configureStore({ReduxDevTools})

store.dispatch(overview.actions.init())

// Render the UI to the screen
ReactDOM.render(
    <Provider store={store}>
        <div>
            <overview.components.Overview grabFocusOnMount={true} />
            {ReduxDevTools && <ReduxDevTools />}
        </div>
    </Provider>,
    document.getElementById('app')
)
