import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { store, ReduxDevTools } from 'src/overview/main'

import options from 'src/options'

ReactDOM.render(
    <Provider store={store}>
        <div>
            <options.components.Options />
            {ReduxDevTools && <ReduxDevTools />}
        </div>
    </Provider>,
    document.getElementById('app')
)
