import React from 'react'

const LinkAsListItem = ({doc}) => (
    <a
        className="LinkAsListItem"
        href={doc.targetUrl}
        // DEBUG Show document props on meta+click
        onClick={e=>{if (e.metaKey) {console.log(doc); e.preventDefault()}}}
    >
        <q cite={doc.targetUrl}>{doc.targetQuote}</q>
    </a>
)

export default LinkAsListItem
