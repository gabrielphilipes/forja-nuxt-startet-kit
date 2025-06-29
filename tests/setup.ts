import { config } from 'dotenv'
import { resolve } from 'path'
import { ofetch, type FetchOptions } from 'ofetch'

config({ path: resolve(process.cwd(), '.env') })

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
