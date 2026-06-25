import express from 'express'
import { resetPasswordValidator } from '../validators/auth.validator.js'
import validate from '../middlewares/validate.middleware.js'
import asyncHandler from '../helpers/asyncHandler.js'
import emailService from '../services/email.service.js'

const resetPassword_Router = express.Router()

resetPassword_Router.post('/', resetPasswordValidator, validate, asyncHandler(async (req, res) => {
  const { token, nueva_contrasena } = req.body
  await emailService.resetPassword(token, nueva_contrasena)

  return res.status(200).json({
    ok: true,
    message: "Contraseña restablecida correctamente. Ya podés iniciar sesión."
  })
}))

export default resetPassword_Router
