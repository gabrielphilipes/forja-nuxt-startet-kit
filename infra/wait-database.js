const { exec } = require('node:child_process')

function checkDatabase() {
  let containerName = process.env.SITE_NAME ?? 'forja'
  containerName = `${containerName}-postgres`.toLowerCase()

  exec(`docker exec ${containerName} pg_isready --host localhost`, handleReturn)

  function handleReturn(error, stdout) {
    if (stdout.search('accepting connections') === -1) {
      process.stdout.write('.')
      checkDatabase()
      return
    }

    console.log('\n🟢 Database is ready and accepting connections!\n')
  }
}

process.stdout.write('\n\nWaiting for database to accept connections\n')
checkDatabase()
