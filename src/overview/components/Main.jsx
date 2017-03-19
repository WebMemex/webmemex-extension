import React, { Component } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import * as actions from '../actions'
import { ourState } from '../selectors'
import Overview from './Overview'



class Main extends Component {
    render() {
        return (
            <Router>
                <Route path='/' component={({location}) => <Overview grabFocusOnMount location={location} { ...this.props } />} />
            </Router>
        )
    }
}


const mapStateToProps = (state) => ({
    query: ourState(state).query,
    searchResult: ourState(state).searchResult,
})

const mapDispatchToProps = (dispatch) => ({
    onInputChanged: input => {
        dispatch(actions.setQuery({query: input}))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(Main)
