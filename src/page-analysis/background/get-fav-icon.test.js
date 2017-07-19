/* eslint-env jest */

import getFavIcon from 'src/page-analysis/background/get-fav-icon'
import { dataURLToBlob } from 'blob-util'

const imageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNiAAAABgADNjd8qAAAAABJRU5ErkJggg=='

describe('getFavIcon tests', () => {
    let imageBlob

    beforeAll(async () => {
        imageBlob = await dataURLToBlob(imageDataUrl)
    })

    test('should return undefined when the favIconUrl is undefined', async () => {
        fetch.mockResponseOnce(imageBlob)
        browser.tabs = {
            get: jest.fn().mockReturnValue({
                favIconUrl: undefined,
            }),
        }
        const favicon = await getFavIcon({tabId: 1})
        expect(favicon).toBeUndefined()
    })

    test('should return the favIcon', async () => {
        fetch.mockResponseOnce(imageBlob)
        browser.tabs = {
            get: jest.fn().mockReturnValue({
                favIconUrl: 'https://example.com',
            }),
        }
        const favicon = await getFavIcon({tabId: 1})
        expect(favicon).toBe(imageDataUrl)
    })
})
