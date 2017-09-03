/* eslint-env jest */

import { makeRangeTransform, makeNonlinearTransform } from './make-range-transform'

describe('makeRangeTransform', () => {
    test('should return transform function with clampOutput false', () => {
        const transformFunction = makeRangeTransform({
            domain: [66, 100],
            range: [9, 200],
            clampOutput: false,
        })
        expect(transformFunction(79)).toBeCloseTo(82.029, 2)
        expect(transformFunction(43)).toBeCloseTo(-120.205, 2)
        expect(transformFunction(170)).toBeCloseTo(593.235, 2)
    })

    test('should return transform function with clampOutput true', () => {
        const transformFunction = makeRangeTransform({
            domain: [93, 117],
            range: [3, 10],
            clampOutput: true,
        })
        expect(transformFunction(99)).toBeCloseTo(4.75, 2)
        expect(transformFunction(83)).toBe(3)
        expect(transformFunction(150)).toBe(10)
    })

    test('should return the inverse of the value for inverted range and domain with clampOutput true', () => {
        const transformFunction1 = makeRangeTransform({
            domain: [100, 0],
            range: [0, 10],
            clampOutput: true,
        })
        expect(transformFunction1(80)).toBe(2)
        const transformFunction2 = makeRangeTransform({
            domain: [0, 100],
            range: [10, 0],
            clampOutput: true,
        })
        expect(transformFunction2(80)).toBe(2)
        const transformFunction3 = makeRangeTransform({
            domain: [100, 0],
            range: [10, 0],
            clampOutput: true,
        })
        expect(transformFunction3(80)).toBe(8)
    })

    test('should return the inverse of the value for inverted range and domain with clampOutput false', () => {
        const transformFunction1 = makeRangeTransform({
            domain: [100, 0],
            range: [0, 10],
            clampOutput: false,
        })
        expect(transformFunction1(80)).toBe(2)
        const transformFunction2 = makeRangeTransform({
            domain: [0, 100],
            range: [10, 0],
            clampOutput: false,
        })
        expect(transformFunction2(80)).toBe(2)
        const transformFunction3 = makeRangeTransform({
            domain: [100, 0],
            range: [10, 0],
            clampOutput: false,
        })
        expect(transformFunction3(80)).toBe(8)
    })
})

describe('makeNonlinearTransform tests', () => {
    test('should return non linear transform function', () => {
        const transformFunction = makeNonlinearTransform({
            domain: [5, 5603],
            range: [0, 100],
            clampOutput: true,
            nonlinearity: Math.log,
        })
        expect(transformFunction(1997)).toBeCloseTo(85.3074, 2)
    })
})
