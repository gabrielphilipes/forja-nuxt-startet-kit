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

  await removeMailcrabEmails()
}, 30000)

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

// Email
const mailcrabPort = process.env.MAILCRAB_PORT || '1080'
const removeMailcrabEmails = async () => {
  await fetch(`http://localhost:${mailcrabPort}/api/delete-all`, {
    method: 'POST'
  })
}

export const getTokenByResetPasswordFromEmail = async (id: string) => {
  const response = await fetch(`http://localhost:${mailcrabPort}/api/message/${id}`)
  const content = await response.json()

  const element = new DOMParser().parseFromString(content.html, 'text/html')

  if (!element.body) {
    throw new Error('Email content not found')
  }

  const resetButton = element.body.querySelector('#reset-password-button') as HTMLAnchorElement
  return resetButton.href.split('?token=')[1]
}

// Mock global useStorage for tests
Object.defineProperty(global, 'useStorage', {
  value: useStorage,
  writable: true
})
