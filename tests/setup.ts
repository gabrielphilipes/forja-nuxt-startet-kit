import { ofetch, type FetchOptions } from 'ofetch'
import { useStorage, clearStorage } from './mocks/storage'
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
}, 30000)

// Mock global do useStorage para os testes
Object.defineProperty(global, 'useStorage', {
  value: useStorage,
  writable: true
})

// Função para limpar o storage entre testes
export const clearTestStorage = () => {
  clearStorage()
}

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
