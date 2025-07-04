import nodemailer from 'nodemailer'

interface BaseEmailPayload {
  toEmail: string
  toName?: string
  subject: string
}

interface TextEmailPayload extends BaseEmailPayload {
  text?: string
  html?: string
}

interface HtmlEmailPayload extends BaseEmailPayload {
  text?: string
  html: string
}

type EmailPayload = TextEmailPayload | HtmlEmailPayload

interface ResponseSendEmail {
  success: boolean
  messageId: string
}

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SMTP_HOST || 'sxsjnefo',
  port: parseInt(process.env.MAIL_SMTP_PORT || '10'),
  secure: process.env.MAIL_SMTP_SECURE === 'true',
  auth: {
    user: process.env.MAIL_SMTP_USERNAME || '',
    pass: process.env.MAIL_SMTP_PASSWORD || ''
  }
})

export const useEmail = async ({
  toEmail,
  toName,
  subject,
  text,
  html
}: EmailPayload): Promise<ResponseSendEmail> => {
  try {
    const result = await transporter.sendMail({
      from: {
        address: process.env.MAIL_FROM_EMAIL || '',
        name: process.env.MAIL_FROM_NAME || ''
      },
      to: [
        {
          address: toEmail,
          name: toName || ''
        }
      ],
      subject,
      text,
      html
    })

    if (!result.messageId) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Falha ao enviar email'
      })
    }

    return { success: true, messageId: result.messageId }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao enviar email',
      cause: error
    })
  }
}
