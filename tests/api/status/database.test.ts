import { request } from '#tests/setup'
import { describe, expect, test } from 'vitest'

describe('GET /api/v1/status/database', () => {
  test('should return database status information', async () => {
    const { status, data } = await request('v1/status/database')

    expect(status).toBe(200)
    expect(data.database.version).toBe('17.5')
    expect(data.database.max_connections).toBe(100)
  })
})
