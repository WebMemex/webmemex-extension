import React from 'react'
import { connect } from 'react-redux'
import { ourState } from '../../selectors'
import { startLoadingHistory, stopLoadingHistory, resumeLoadingHistory } from '../../actions'
import ImportComponent from '../../components/import'


const mapStateToProps = state => ({
    loadingStatus: ourState(state).loadingHistoryStatus,
    searchIndexRebuildingStatus: ourState(state).searchIndexRebuildingStatus,
    historyStats: { // demo statistics
        saved: 3000,
        sizeEngaged: 600,
        notDownloaded: 1500,
        sizeRequired: 300,
        timeEstim: 80
    },
    bookmarksStats: { // demo statistics
        saved: 4000,
        sizeEngaged: 350,
        notDownloaded: 2000,
        sizeRequired: 350,
        timeEstim: 130
    }
})

const mapDispatchToProps = dispatch => ({
    startLoading: (evt) => {
        evt.preventDefault()
        dispatch(startLoadingHistory())
    },
    pauseLoading: (evt) => {
        evt.preventDefault()
        dispatch(stopLoadingHistory({
            status: 'paused' // specify the reason of stop, can be 'pause', 'error', etc
        }))
    },
    resumeLoading:  (evt) => {
        evt.preventDefault()
        dispatch(resumeLoadingHistory())
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(ImportComponent)
