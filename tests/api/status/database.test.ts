import { describe, expect, test } from 'vitest'

describe('Check database status', () => {
  test('retrieving current system status', async () => {
    const request = await fetch('http://localhost:3000/api/v1/status/database')
    const body = await request.json()

    expect(request.status).toBe(200)
    expect(body.database.version).toBe('17.4')
    expect(body.database.max_connections).toBe(100)
    expect(body.database.opened_connections).toBe(1)
  })
})
