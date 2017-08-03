/* eslint-env jest */

import { makeRangeTransform, makeNonlinearTransform } from './make-range-transform'

describe('makeRangeTransform', () => {
    test('should return transform function with clampOutput false', () => {
        const transformFunction1 = makeRangeTransform({
            domain: [66, 100],
            range: [9, 200],
            clampOutput: false,
        })
        expect(transformFunction1(79)).toBeCloseTo(82.029, 2)
        const transformFunction2 = makeRangeTransform({
            domain: [66, 200],
            range: [9, 100],
            clampOutput: false,
        })
        expect(transformFunction2(87)).toBeCloseTo(23.2611, 2)
        const transformFunction3 = makeRangeTransform({
            domain: [66, 100],
            range: [9, 200],
            clampOutput: false,
        })
        expect(transformFunction3(40)).toBeCloseTo(-137.0588, 2)
        const transformFunction4 = makeRangeTransform({
            domain: [66, 200],
            range: [9, 100],
            clampOutput: false,
        })
        expect(transformFunction4(270)).toBeCloseTo(147.537, 2)
    })

    test('should return transform function with clampOutput true', () => {
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
        const transformFunction3 = makeRangeTransform({
            domain: [93, 117],
            range: [0, 10],
            clampOutput: true,
        })
        expect(transformFunction3(60)).toBe(0)
        const transformFunction4 = makeRangeTransform({
            domain: [97, 114],
            range: [3, 7],
            clampOutput: true,
        })
        expect(transformFunction4(150)).toBe(7)
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
        expect(transformFunction2(80)).toBe(10)
        const transformFunction3 = makeRangeTransform({
            domain: [100, 0],
            range: [10, 0],
            clampOutput: true,
        })
        expect(transformFunction3(80)).toBe(10)
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
