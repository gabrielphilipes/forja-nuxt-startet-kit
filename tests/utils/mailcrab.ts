const mailcrabPort = process.env.MAILCRAB_PORT || '1080'
const mailcrabUrl = `http://localhost:${mailcrabPort}/api`

const getEmails = async (email: string) => {
  // Wait for mailcrab to be ready
  await new Promise((resolve) => setTimeout(resolve, 500))

  const response = await fetch(`${mailcrabUrl}/messages`)

  if (!response.ok) {
    throw new Error(`Falha ao buscar e-mails do mailcrab: ${response.text}`)
  }

  const messages = await response.json()

  const filteredMessages = messages.filter((msg: { envelope_recipients: string[] }) =>
    msg.envelope_recipients.includes(email)
  )

  return filteredMessages.reverse()
}

const getEmailById = async (emailId: string) => {
  const response = await fetch(`${mailcrabUrl}/message/${emailId}`)
  return response.json()
}

const getTokenByResetPasswordFromEmail = async (emailId: string) => {
  const response = await fetch(`${mailcrabUrl}/message/${emailId}`)
  const content = await response.json()

  const element = new DOMParser().parseFromString(content.html, 'text/html')

  if (!element.body) {
    throw new Error('Email content not found')
  }

  const resetButton = element.body.querySelector('#reset-password-button') as HTMLAnchorElement
  return resetButton.href.split('?token=')[1]
}

export default {
  getEmails,
  getEmailById,
  getTokenByResetPasswordFromEmail
}
