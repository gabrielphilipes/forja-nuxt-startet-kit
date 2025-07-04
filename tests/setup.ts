import { ofetch, type FetchOptions } from 'ofetch'
import { useStorage } from './mocks/storage'
import { beforeAll } from 'vitest'
import retry from 'async-retry'

beforeAll(async () => {
  // Wait for the web server to start
  const waitForWebServer = async () => {
    const fetchStatusPage = async () => {
      const response = await fetch('http://localhost:3000')

      if (!response.ok) {
        console.log('Waiting for web server to start...')
        throw Error()
      }
    }

    return retry(fetchStatusPage, {
      retries: 30, // 30 retries
      maxTimeout: 1000 // Timeout 1 second
    })
  }

  await waitForWebServer()

  const mailcrabPort = process.env.MAILCRAB_PORT || '1080'

  await fetch(`http://localhost:${mailcrabPort}/api/delete-all`, {
    method: 'POST'
  })
})

export const request = async (url: string, options: FetchOptions = {}) => {
  options.ignoreResponseError = true

  const request = await ofetch.raw(`http://localhost:3000/api/${url}`, options)

  return {
    status: request.status,
    headers: request.headers,
    data: request._data,
    all: request
  }
}

// Mock global useStorage for tests
Object.defineProperty(global, 'useStorage', {
  value: useStorage,
  writable: true
})
