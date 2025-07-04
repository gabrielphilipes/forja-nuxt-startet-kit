const mailcrabPort = process.env.MAILCRAB_PORT || '1080'

const response = await fetch(`http://localhost:${mailcrabPort}/api/delete-all`, {
  method: 'POST'
})

if (!response.ok) {
  console.error('Failed to clear Mailcrab')
}

console.log(response.status, response.statusText)
