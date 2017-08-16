/* eslint-env jest */

import { makeRangeTransform, makeNonlinearTransform } from 'src/util/make-range-transform'

describe('makeRangeTransform tests', () => {
    test('should return transform function with clampOutput false', () => {
        expect.assertions(2)
        const transformFunction1 = makeRangeTransform({
            domain: [0, 100],
            range: [0, 200],
            clampOutput: false,
        })
        expect(transformFunction1(50)).toBe(100)
        const transformFunction2 = makeRangeTransform({
            domain: [0, 200],
            range: [0, 100],
            clampOutput: false,
        })
        expect(transformFunction2(50)).toBe(25)
    })

    test('should return transform function with clampOutput true', () => {
        expect.assertions(2)
        const transformFunction1 = makeRangeTransform({
            domain: [93, 117],
            range: [0, 10],
            clampOutput: true,
        })
        expect(transformFunction1(99)).toBe(2.5)
        const transformFunction2 = makeRangeTransform({
            domain: [97, 114],
            range: [3, 7],
            clampOutput: true,
        })
        expect(transformFunction2(103)).toBeCloseTo(4.41, 2)
    })
})

describe('makeNonlinearTransform tests', () => {
    test('should return non linear transform function', () => {
        const transformFunction = makeNonlinearTransform({
            domain: [1000 * 60 * 5, 1000 * 60 * 60 * 24],
            range: [0, 100],
            clampOutput: true,
            nonlinearity: Math.log,
        })
        expect(transformFunction(60 * 60 * 1000)).toBeCloseTo(43.88, 2)
    })
})
