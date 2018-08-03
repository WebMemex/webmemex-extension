import docuri from 'docuri'
import randomString from 'src/util/random-string'

export * from './create-page'
export * from './delete-page'
export * from './download-page'
export * from './get-pages'
export * from './text-search'

export const pageKeyPrefix = 'page/'

export const convertPageDocId = docuri.route(`${pageKeyPrefix}:timestamp/:nonce`)

export function generatePageDocId({timestamp, nonce} = {}) {
    const date = timestamp ? new Date(timestamp) : new Date()
    return convertPageDocId({
        timestamp: date.getTime(),
        nonce: nonce || randomString(),
    })
}

export const getTimestamp = doc => Number.parseInt(convertPageDocId(doc._id).timestamp)
