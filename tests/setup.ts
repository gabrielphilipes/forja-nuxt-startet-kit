import { ofetch, type FetchOptions } from 'ofetch'
import { useStorage } from './mocks/storage'
import { beforeAll, expect } from 'vitest'
import retry from 'async-retry'
import userTest from '#tests/utils/user'

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

export const createValidSession = async (email: string) => {
  const payload = {
    email,
    password: 'ValidPass123!'
  }

  const userCreated = await userTest.register(payload.email, payload.password)
  expect(userCreated).toBe(true)

  const { status, headers } = await request('v1/auth/login', {
    method: 'POST',
    body: payload
  })

  expect(status).toBe(204)

  const sessionCookie = headers.get('Set-Cookie')
  expect(sessionCookie).toBeDefined()
  expect(sessionCookie).toContain('nuxt-session')

  if (!sessionCookie) {
    throw new Error('Session cookie not found')
  }

  return sessionCookie
}

// Mock global useStorage for tests
Object.defineProperty(global, 'useStorage', {
  value: useStorage,
  writable: true
})
