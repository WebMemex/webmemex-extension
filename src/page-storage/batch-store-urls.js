import Rx from 'rxjs'
import { reidentifyOrStorePage } from './store-page'

// Creates a deferred promise from inner analysis promise of `reidentifyOrStorePage`
// NOTE: This is probably not done the best way; can't get my head around deferring on inner promise with Rx
const deferAnalysis = url => Rx.Observable.defer(() =>
    reidentifyOrStorePage({ url }).then(res => res.finalPagePromise))

/**
 * Given a Set of URLs, will attempt to concurrently batch fetch them in the background.
 *
 * @param {Set} batch The total batch of URLs to operate on.
 * @param {number} [concurrency=5] How many URLs to be fetching at the same time.
 * @returns {any} Object containing batch handling functions.
 */
export default function initURLBatch(batch, concurrency = 5) {
    // Uses mergeMap to handle concurrently processing the deferred promises
    const fetchAndAnalyse = Rx.Observable.from(batch)
        .mergeMap(
            url => deferAnalysis(url),
            url => url,
            concurrency,
        )

    // Interface to use this batch
    return {
        subscribe: observer => fetchAndAnalyse.subscribe(observer),
    }
}
