import { request } from '../../setup'
import { describe, expect, test } from 'vitest'

describe('GET /api/v1/status/database', () => {
  test('should return database status information', async () => {
    const { status, data } = await request('v1/status/database')

    expect(status).toBe(200)
    expect(data.database.version).toBe('17.4')
    expect(data.database.max_connections).toBe(100)
    expect(data.database.opened_connections).toBe(1)
  })
})
