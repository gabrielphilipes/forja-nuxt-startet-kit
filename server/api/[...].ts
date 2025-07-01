export default defineEventHandler((event) => {
  const url = getRequestURL(event)

  if (url.pathname.startsWith('/api')) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: `Endpoint "${url.pathname}" not found.`
    })
  }

  return
})
