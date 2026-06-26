function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`)

  if (err.status) {
    return res.status(err.status).json({
      ok: false,
      status: err.status,
      message: err.message
    })
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({
      ok: false,
      status: 400,
      message: messages.join(', ')
    })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      ok: false,
      status: 400,
      message: `ID inválido: ${err.value}`
    })
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({
      ok: false,
      status: 409,
      message: `El valor para '${field}' ya existe`
    })
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.name === 'NotBeforeError') {
    return res.status(401).json({
      ok: false,
      status: 401,
      message: 'Token inválido o expirado'
    })
  }

  console.error('Error crítico:', err)
  return res.status(500).json({
    ok: false,
    status: 500,
    message: 'Error interno del servidor'
  })
}

export default errorHandler
