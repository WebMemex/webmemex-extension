import Rx from 'rxjs'

// Given a RxJS Subject + Observable, makes that Observable pausable by sending bools to Subject
const createPausable = (subject, getObservable) => subject.switchMap(running =>
    Rx.Observable.if(() => running, getObservable(), Rx.Observable.empty()))

/**
 * Given a Set of input and an async function, will attempt to concurrently batch process them in the background.
 *
 * Note that if the async function resolves to another Promise that is wanted to be defered,
 * handle resolving that in the `callback` and set `innerPromise`.
 *
 * @param {Iterable<any>} batch The total batch of input to operate on.
 * @param {(input: any) => Promise<any|Promise<any>>} callback The callback to run each input on, either
 *      returning a promise or a promise that will return an inner promise to defer on.
 * @param {boolean} [innerPromise=false] Denotes whether to defer on the Promise returned by callback,
 *      or an inner Promise of that promise.
 * @param {number} [concurrency=5] How many promises to be waiting at any time.
 * @returns {any} Object containing batch handling functions.
 */
function initBatch({ batch, callback, innerPromise = false, concurrency = 5 }) {
    // State to keep track of progress
    const processed = new Set()

    /**
     * Gets Observable built on the batch input. It uses state to track which inputs
     * have been processed already (done right at the end of stream ops), and checks
     * that state for every new input (to make sure it isn't a dupe or if it was
     * already processed on a previous invocation).
     */
    const getObservable = () => {
        const filteredInputObs = Rx.Observable.from(batch)
            .filter(input => !processed.has(input))  // Ignore already-processed values

        // Map input to pre-processing to emit promises to stream
        //  mergeMap needs to be used if innerPromise set (need to wait on outter promise)
        // Note that both emit objects of type { input, promise } to the next step; this
        //  promise is the Promise that will be defered and batched
        const promiseObs = innerPromise
            ? filteredInputObs.mergeMap(
                input => callback(input),
                (input, innerPromise) => ({ input, promise: innerPromise }),
            )
            : filteredInputObs.map(
                input => ({ input, promise: callback(input) }),
            )

        // Main promise batching logic now that there is an observable stream of Promises
        return promiseObs
            .mergeMap(
                ({ input, promise }) => Rx.Observable.defer(promise),  // Defer all promises to stop them processing
                ({ input }, result) => ({ input, result }),
                concurrency,  // Allow n promises to process at a time
             )
            .do(({ input }) => processed.add(input))  // Update state as input gets processed
    }

    // Pauser subject to handle stopping, starting and resuming operations on input observable
    const pauser = createPausable(new Rx.Subject(), getObservable)

    // Interface to use this batch
    return {
        pause: () => pauser.next(false),
        resume: () => pauser.next(true),
        getProgress: () => processed,
        terminate: () => {
            pauser.next(false)  // Make sure pauser doesn't use input observable
            pauser.complete()   // Send complete notification to pauser Subject
            processed.clear()   // Reset the state
        },
        subscribe(observer) {
            const sub = pauser.subscribe(observer)
            pauser.next(true)   // Make sure pauser is set to run
            return sub          // Allow caller to manage sub
        },
    }
}

// Export a HOF that binds callbacks to a batch initialser
export default (callback, innerPromise = false) =>
    (batch, concurrency = 5) => initBatch({ batch, callback, innerPromise, concurrency })
