import express from 'express'
import { resendVerificationValidator } from '../validators/auth.validator.js'
import validate from '../middlewares/validate.middleware.js'
import asyncHandler from '../helpers/asyncHandler.js'
import emailService from '../services/email.service.js'

const email_Router = express.Router()

email_Router.post('/', resendVerificationValidator, validate, asyncHandler(async (req, res) => {
  const { email } = req.body
  await emailService.resendVerification(email)
  return res.status(200).json({ message: "Email enviado correctamente" })
}))

export default email_Router
