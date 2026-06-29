import { body, query } from 'express-validator'

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Email inválido'),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
]

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Email inválido'),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
]

export const verifyEmailValidator = [
  query('verification_token')
    .notEmpty().withMessage('El token de verificación es obligatorio')
]

export const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Email inválido')
]

export const resetPasswordValidator = [
  body('token')
    .notEmpty().withMessage('El token es obligatorio'),
  body('nueva_contrasena')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
]

export const resendVerificationValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Email inválido')
]

export const sendInvitationValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Email inválido')
]
