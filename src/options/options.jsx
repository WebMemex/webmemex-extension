import React from 'react'
import ReactDOM from 'react-dom'

import { getStatistics } from 'src/local-storage'
import Main from './Main'

async function render() {
    const containerElement = document.getElementById('app')

    const stats = await getStatistics()
    const props = {
        numberOfSnapshots: stats.numberOfPages,
        totalSnapshotSizeInMB: Math.round(stats.totalSizeOfPages / 1024**2),
    }

    ReactDOM.render(
        <Main {...props} />,
        containerElement
    )
}

function main() {
    render()
}

main()
