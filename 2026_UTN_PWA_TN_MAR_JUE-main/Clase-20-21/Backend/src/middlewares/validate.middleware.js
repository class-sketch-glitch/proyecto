import { validationResult } from 'express-validator'

function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      status: 400,
      message: 'Error de validación',
      errors: errors.array().map(e => ({
        field: e.path,
        message: e.msg
      }))
    })
  }
  next()
}

export default validate
