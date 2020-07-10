// A few helpers to create and use async generators that support more granular back-pressure.
// This enables composing multiple generators into one, while applying the appropriate back-pressure
// to each.
// The idea is that the generator's consumer, instead of having to wait with calling `next()` until
// processing the previously emitted item has completed, can pass it a promise to let the generator
// know about this later. The generator can then already emit more items if it is able to, or wait
// for its received promise(s) to resolve before continuing.

// forEach is similar to `for await (x of generator) { func(x) }`, but passes func(x) as feedback to
// the generator, so that the generator can observe when func will have completed.
export async function forAwait(generator, func) {
    let nextArgument
    while (true) {
        const { value, done } = await generator.next(nextArgument)
        if (done) return value
        nextArgument = func(value)
    }
}

// Wrap a generatorFunction so that when invoked, it is instantiated multiple times under the hood.
export function parallelise(generatorFunction, parallelism) {
    // Make created sub-generators sensitive to our promise-based back-pressure.
    generatorFunction = sequential(generatorFunction)

    return async function * parallelGenerator(...args) {
        // Create N generators from generatorFunction (N = parallelism).
        const subGenerators = new Array(parallelism).fill().map(() =>
            generatorFunction(...args),
        )

        // Merge them into a single generator.
        const returnValues = yield * merge(subGenerators)
        return returnValues
    }
}

// Wrap a generatorFunction to make its generators listen to our promise-based back-pressure.
function sequential(generatorFunction) {
    return async function * sequentialGenerator(...args) {
        const generator = generatorFunction(...args)
        let nextArgument
        while (true) {
            const { done, value } = await generator.next(nextArgument)
            if (done) return value
            const possiblyAPromise = yield value
            // Besides awaiting the promise, we will also pass it further up to generator.next().
            nextArgument = await possiblyAPromise
        }
    }
}

// Pass on the items from multiple input generators. The consumer's feedback is passed back to the
// individual generators, which can thus throttle their production.
async function * merge(generators) {
    const returnValues = new Array(generators.length)
    const promises = generators.map(generator => generator.next())
    // Continue as long as at least one generator is not yet exhausted.
    while (promises.some(x => true)) {
        // Wait for one of the generators to produce a new value.
        const { i, value, done } = await Promise.race(
            promises
                // Add the index to return value, so we know which of the Promises won.
                .map((p, i) => Promise.resolve(p).then(({ value, done }) => ({ i, value, done })))
                // Omit empty slots (Promise.race would treat them as undefined and let them win).
                .filter(x => true),
        )
        if (done) {
            returnValues[i] = value
            delete promises[i]
        } else {
            const possiblyAPromise = yield value
            // Replace the resolved promise with the corresponding generator's next promise/value.
            promises[i] = generators[i].next(possiblyAPromise)
        }
    }
    // This was the last generator to exhaust. Return each generator's return value.
    return returnValues
}
