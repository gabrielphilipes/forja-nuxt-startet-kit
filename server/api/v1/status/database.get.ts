export default defineEventHandler(async () => {
  const version = await useQueryDB('SHOW server_version;')
  const maxConnections = await useQueryDB('SHOW max_connections;')
  const openedConnections = await useQueryDB(
    'SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;',
    [process.env.POSTGRES_DB]
  )

  return {
    updated_at: new Date().toISOString(),
    database: {
      version: version.rows[0].server_version,
      max_connections: parseInt(maxConnections.rows[0].max_connections),
      opened_connections: parseInt(openedConnections.rows[0].count)
    }
  }
})
