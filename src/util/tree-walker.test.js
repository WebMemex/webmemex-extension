/* eslint-env jest */

import { getAllNodes, getRoot } from './tree-walker'

describe('getAllNodes', () => {
    test('should call the functions passed to it', async () => {
        expect.assertions(2)
        const getParent = jest.fn()
        const getChildren = jest.fn().mockReturnValue([])
        await getAllNodes({getParent, getChildren})({})
        expect(getParent).toHaveBeenCalled()
        expect(getChildren).toHaveBeenCalled()
    })

    test('should return all the nodes as an array', async () => {
        expect.assertions(3)
        const getParent = jest.fn().mockReturnValueOnce(
            new Promise((resolve, reject) => {
                resolve({
                    name: 'root',
                })
            })
        )
        const getChildren = jest.fn().mockReturnValueOnce(
            new Promise((resolve, reject) => {
                resolve([{name: 'child'}])
            })
        ).mockReturnValueOnce(
            new Promise((resolve, reject) => {
                resolve([])
            })
        )
        const nodes = await getAllNodes({getParent, getChildren})({})
        expect(nodes.length).toBe(2)
        expect(nodes[0].name).toBe('root')
        expect(nodes[1].name).toBe('child')
    })
})

describe('getRoot', () => {
    test('should call the function passed to it', async () => {
        const getParent = jest.fn()
        await getRoot({getParent})({})
        expect(getParent).toBeCalled()
    })

    test('should return the root of a tree', async () => {
        const getParent = jest.fn().mockReturnValueOnce(
            new Promise((resolve, reject) => {
                resolve({
                    name: 'child',
                })
            })
        ).mockReturnValueOnce(
            new Promise((resolve, reject) => {
                resolve({
                    name: 'root',
                })
            })
        )
        let root = await getRoot({getParent})({})
        expect(root.name).toBe('root')
    })
})
