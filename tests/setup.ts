import { ofetch, type FetchOptions } from 'ofetch'
import { useStorage, clearStorage } from './mocks/storage'

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
