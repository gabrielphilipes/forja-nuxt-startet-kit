import type { H3Event } from 'h3'
import user from '../../../models/user'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const input = JSON.parse(body)
  await user.createUsingPassword(input)

  setResponseStatus(event, 201)
})
