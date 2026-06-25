import express from 'express'
import authController from '../controllers/auth.controller.js'
import { registerValidator, loginValidator, verifyEmailValidator, sendInvitationValidator } from '../validators/auth.validator.js'
import validate from '../middlewares/validate.middleware.js'
import asyncHandler from '../helpers/asyncHandler.js'

const authRouter = express.Router()

authRouter.post('/register', registerValidator, validate, asyncHandler(authController.register))
authRouter.get('/verify-email', verifyEmailValidator, validate, asyncHandler(authController.verifyEmail))
authRouter.post('/login', loginValidator, validate, asyncHandler(authController.login))
authRouter.post('/email_invitacion', sendInvitationValidator, validate, asyncHandler(authController.findByEmail))

export default authRouter
