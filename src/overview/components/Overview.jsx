import React from 'react'
import createBrowserHistory from 'history/createBrowserHistory'

import ResultList from './ResultList'
import LoadingIndicator from './LoadingIndicator'

import styles from './Overview.css'

class Overview extends React.Component {
    render() {
        return <div>
            <input
                className={styles.query}
                onChange={e=>this.handleInputChange(e.target.value)}
                placeholder="Search your memory"
                value={this.props.query}
                ref='inputQuery'
            >
            </input>
            {this.props.waitingForResults
                ? <LoadingIndicator />
                : <ResultList searchResult={this.props.searchResult} searchQuery={this.props.query} />
            }
        </div>
    }

    componentDidMount() {
        if (this.props.grabFocusOnMount) {
            this.refs['inputQuery'].focus()
        }
    }
    componentWillMount() {
        const query = new URLSearchParams(this.props.location.search).get('q')
        if(query) {
            this.props.onInputChanged(query)
        }
    }
    handleInputChange(query) {
        const history = createBrowserHistory()
        history.push({ pathname: '/overview/overview.html',search: `?q=${query}` })
        this.props.onInputChanged(query)
    }
}

export default Overview
