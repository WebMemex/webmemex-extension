/* eslint-env jest */

import { remoteFunction } from './webextensionRPC'

describe('remoteFunction', () => {
    beforeEach(() => {
        browser.runtime = {
            sendMessage: jest.fn(() => Promise.resolve()),
        }
        browser.tabs = {
            sendMessage: jest.fn(() => Promise.resolve()),
        }
    })

    test('should create a function', () => {
        const remoteFunc = remoteFunction('remoteFunc', { tabId: 1 })
        expect(remoteFunc.name).toBe('remoteFunc_RPC')
        expect(typeof remoteFunc).toBe('function')
    })

    test('should throw an error when unable to sendMessage', async () => {
        const remoteFunc = remoteFunction('remoteFunc', { tabId: 1 })
        browser.tabs.sendMessage.mockImplementationOnce(() => { throw new Error() })
        await expect(remoteFunc()).rejects.toMatchObject({
            message: `Got no response when trying to call 'remoteFunc'. Did you enable RPC in the tab's content script?`,
        })
    })

    test('should call the browser.tabs function when tabId is given', async () => {
        const remoteFunc = remoteFunction('remoteFunc', { tabId: 1 })
        try {
            await remoteFunc()
        } catch (e) {}
        expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(1)
        expect(browser.runtime.sendMessage).toHaveBeenCalledTimes(0)
    })

    test('should call the browser.runtime function when tabId is undefined', async () => {
        const remoteFunc = remoteFunction('remoteFunc')
        try {
            await remoteFunc()
        } catch (e) {}
        expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(0)
        expect(browser.runtime.sendMessage).toHaveBeenCalledTimes(1)
    })

    test('should throw an "interfering listener" error if response is unrecognised', async () => {
        browser.tabs.sendMessage.mockReturnValueOnce('some unexpected return value')
        const remoteFunc = remoteFunction('remoteFunc', { tabId: 1 })
        await expect(remoteFunc()).rejects.toMatchObject({
            message: expect.stringContaining('RPC got a response from an interfering listener'),
        })
    })

    test('should throw a "no response" error if sending the message fails', async () => {
        browser.tabs.sendMessage.mockReturnValueOnce(Promise.reject(new Error()))
        const remoteFunc = remoteFunction('remoteFunc', { tabId: 1 })
        await expect(remoteFunc()).rejects.toMatchObject({
            message: expect.stringContaining('Got no response'),
        })
    })

    test('should throw a "no response" error if response is undefined', async () => {
        // It seems we can get back undefined when the tab is closed before the response is sent.
        // In such cases 'no response' seems a better error message than 'interfering listener'.
        browser.tabs.sendMessage.mockReturnValueOnce(undefined)
        const remoteFunc = remoteFunction('remoteFunc', { tabId: 1 })
        await expect(remoteFunc()).rejects.toMatchObject({
            message: expect.stringContaining('Got no response'),
        })
    })

    test('should throw an error if the response contains an error message', async () => {
        browser.tabs.sendMessage.mockReturnValueOnce({
            __RPC_RESPONSE__: '__RPC_RESPONSE__',
            errorMessage: 'Remote function error',
        })
        const remoteFunc = remoteFunction('remoteFunc', { tabId: 1 })
        await expect(remoteFunc()).rejects.toMatchObject({
            message: 'Remote function error',
        })
    })

    test('should return the value contained in the response', async () => {
        browser.tabs.sendMessage.mockReturnValueOnce({
            __RPC_RESPONSE__: '__RPC_RESPONSE__',
            returnValue: 'Remote function return value',
        })
        const remoteFunc = remoteFunction('remoteFunc', { tabId: 1 })
        await expect(remoteFunc()).resolves.toBe('Remote function return value')
    })
})

// TODO Test behaviour of executing side.
