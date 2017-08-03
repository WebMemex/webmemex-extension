/* eslint-env jest */

import { remoteFunction } from './webextensionRPC'

describe('remoteFunction', () => {
    test('should return a remotely callable function', () => {
        const remoteFunc = remoteFunction('remoteFunc', {tabId: 1})
        expect(remoteFunc.name).toBe('remoteFunc_RPC')
    })

    test('should throw an error when remoteFunc is called', async () => {
        const remoteFunc = remoteFunction('remoteFunc', {tabId: 1})
        try {
            await remoteFunc()
        } catch (err) {
            expect(err.toString()).toBe(`Error: Got no response when trying to call 'remoteFunc'. Did you enable RPC in the tab's content script?`)
        }
    })

    test('should call the browser.tabs function when tabId is valid', async () => {
        browser.tabs = {
            sendMessage: jest.fn(),
        }
        browser.runtime = {
            sendMessage: jest.fn(),
        }
        const remoteFunc = remoteFunction('remoteFunc', {tabId: 1})
        try {
            await remoteFunc()
        } catch (e) {}
        expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(1)
        expect(browser.runtime.sendMessage).toHaveBeenCalledTimes(0)
    })

    test('should call the browser.runtime function when tabId is invalid', async () => {
        browser.tabs = {
            sendMessage: jest.fn(),
        }
        browser.runtime = {
            sendMessage: jest.fn(),
        }
        const remoteFunc = remoteFunction('remoteFunc')
        try {
            await remoteFunc()
        } catch (e) {}
        expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(0)
        expect(browser.runtime.sendMessage).toHaveBeenCalledTimes(1)
    })

    test('should throw an error if there is an interfering listener', async () => {
        expect.assertions(1)
        browser.tabs = {
            sendMessage: jest.fn(),
        }
        const remoteFunc = remoteFunction('remoteFunc', {tabId: 1})
        try {
            await remoteFunc()
        } catch (err) {
            expect(err.toString()).toBe('Error: RPC got a response from an interfering listener.')
        }
    })

    test('should throw the error if in the response', async () => {
        expect.assertions(1)
        browser.tabs = {
            sendMessage: jest.fn().mockReturnValue({
                __RPC_RESPONSE__: '__RPC_RESPONSE__',
                errorMessage: 'Remote function error',
            }),
        }
        const remoteFunc = remoteFunction('remoteFunc', {tabId: 1})
        try {
            await remoteFunc()
        } catch (err) {
            expect(err.toString()).toBe('Error: Remote function error')
        }
    })

    test('should return the value in the response', async () => {
        browser.tabs = {
            sendMessage: jest.fn().mockReturnValue({
                __RPC_RESPONSE__: '__RPC_RESPONSE__',
                returnValue: 'Remote Function return value',
            }),
        }
        const remoteFunc = remoteFunction('remoteFunc', {tabId: 1})
        const data = await remoteFunc()
        expect(data).toBe('Remote Function return value')
    })
})
