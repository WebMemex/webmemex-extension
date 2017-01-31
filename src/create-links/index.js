import docuri from 'docuri'

export const linkKeyPrefix = 'link/'

// Creates an _id string given the variables, or vice versa parses such strings
// We simply use the creation time for the id, for easy chronological sorting.
export const convertLinkDocId = docuri.route(`${linkKeyPrefix}:timestamp/:nonce`)
