import Rx from 'rxjs'
import { reidentifyOrStorePage } from './store-page'

// Give two Sets; will spit out a new Set containing everything in a that wasn't in b
const diffSets = (a, b) => new Set([...a].filter(el => !b.has(el)))

// Given a RxJS Subject + Observable, makes that Observable pausable by sending bools to Subject
const createPausable = (subject, observer) => subject.switchMap(running =>
    Rx.Observable.if(() => running, observer, Rx.Observable.empty()))

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
    // State to keep track of progress
    const processed = new Set()

    // Uses mergeMap to handle concurrently processing the deferred promises
    const fetchAndAnalyse = data => Rx.Observable.from(data)
        .mergeMap(
            url => deferAnalysis(url),
            url => url,
            concurrency,
        )
        .do(url => processed.add(url))

    const pauser = new Rx.Subject()
    const pausable = createPausable(pauser, fetchAndAnalyse(diffSets(batch, processed)))

    // Interface to use this batch
    return {
        pause: () => pauser.next(false),
        resume: () => pauser.next(true),
        getRemaining: () => diffSets(batch, processed),
        subscribe(observer) {
            const sub = pausable.subscribe(observer)
            pauser.next(true)   // Make sure pauser is set to run
            return sub          // Allow caller to manage sub
        },
    }
}
