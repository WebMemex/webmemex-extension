import React from 'react'
import PropTypes from 'prop-types'
import Waypoint from 'react-waypoint'
import moment from 'moment'

import PageAsListItem from './PageAsListItem'
import LoadingIndicator from './LoadingIndicator'
import styles from './ResultList.css'

function dateString(timestamp) {
    return moment(timestamp).format('DD-MM-YYYY')
}

const ResultList = ({
    searchResult,
    searchQuery,
    endDate,
    waitingForResults,
    onBottomReached,
}) => {
    // If there are no results, show a message.
    if (searchResult.rows.length === 0
        && searchQuery !== ''
        && !waitingForResults
    ) {
        return (
            <p className={styles.noResultMessage}>
                no results {endDate && `(up to ${dateString(endDate)})`}
            </p>
        )
    }

    const listItems = searchResult.rows.map(row => (
        <li
            key={row.doc._id}
        >
            <div>
                <PageAsListItem
                    doc={row.doc}
                />
            </div>
        </li>
    ))

    // Insert waypoint to trigger loading new items when scrolling down.
    if (!waitingForResults && !searchResult.resultsExhausted) {
        const waypoint = <Waypoint onEnter={onBottomReached} key='waypoint' />
        // Put the waypoint a bit before the bottom, except if the list is short.
        const waypointPosition = Math.max(Math.min(5, listItems.length), listItems.length - 5)
        listItems.splice(waypointPosition, 0, waypoint)
    }

    return (
        <ul className={styles.root}>
            {endDate && (
                <li className={styles.skippingToDateMessage}>
                    …skipping snapshots made after {dateString(endDate)}…
                </li>
            )}
            {listItems}
            {waitingForResults && <LoadingIndicator />}
        </ul>
    )
}

ResultList.propTypes = {
    searchResult: PropTypes.object,
    searchQuery: PropTypes.string,
    endDate: PropTypes.number,
    waitingForResults: PropTypes.bool,
    onBottomReached: PropTypes.func,
}

export default ResultList
