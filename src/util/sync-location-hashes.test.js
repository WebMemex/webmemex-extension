/* eslint-env jest */

import syncLocationHashes from './sync-location-hashes'


const createWindowMock = () => ({
    // FIXME When getting a (non-empty) hash attribute, location.hash should prepend a missing '#'.
    // (therefore we now test the value of location.hash with a regex)
    location: {hash: ''},
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
})

describe('syncLocationHashes', () => {
    const win1 = createWindowMock()
    const win2 = createWindowMock()
    const win3 = createWindowMock()
    const windows = [win1, win2, win3]

    beforeEach(() => {
        windows.forEach(win => {
            win.addEventListener.mockReset()
            win.removeEventListener.mockReset()
        })
        win1.location.hash = '#win1hash'
        win2.location.hash = '#win2hash'
        win3.location.hash = '#win3hash'
    })

    test('should create a listener on the windows', () => {
        syncLocationHashes(windows, {initial: undefined})
        windows.forEach(win => {
            expect(win.addEventListener).toHaveBeenCalledTimes(1)
        })
    })

    test('should disable the listeners when returned function is called', () => {
        const disableListener = syncLocationHashes(windows, {initial: undefined})
        windows.forEach(win => {
            expect(win.removeEventListener).not.toHaveBeenCalled()
        })

        disableListener()

        windows.forEach(win => {
            expect(win.removeEventListener.mock.calls).toEqual(win.addEventListener.mock.calls)
        })
    })

    test('should directly perform an initial sync if specified', () => {
        win2.location.hash = '#somehash'
        syncLocationHashes(windows, {initial: win2})

        windows.forEach(win => {
            expect(win.location.hash).toMatch(/#?somehash/)
        })
    })

    test('should sync to other windows when one emits a hashchange event', () => {
        syncLocationHashes(windows, {initial: undefined})
        const win2HashChangeEventListener = win2.addEventListener.mock.calls[0][1]

        win2.location.hash = '#newhash'
        win2HashChangeEventListener()

        windows.forEach(win => {
            expect(win.location.hash).toMatch(/#?newhash/)
        })
    })
})
