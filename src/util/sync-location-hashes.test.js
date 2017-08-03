/* eslint-env jest */

import syncLocationHashes from './sync-location-hashes'

function createWindowStub({hash}) {
    return [{
        location: {hash},
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    }]
}

describe('syncLocationHashes', () => {
    test('should create a listener on the window', () => {
        const windows = createWindowStub({hash: 'home'})
        const disableListener = syncLocationHashes(windows, {initial: undefined})
        expect(windows[0].addEventListener).toBeCalled()
        disableListener()
    })

    test('should disable the listener when return function is called', () => {
        const windows = createWindowStub({hash: 'home'})
        const disableListener = syncLocationHashes(windows, {initial: undefined})
        disableListener()
        expect(windows[0].removeEventListener).toBeCalled()
    })
})
