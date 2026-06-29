import { body, param } from 'express-validator'

export const createWorkspaceValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre del espacio de trabajo es obligatorio'),
  body('descripcion')
    .optional()
    .trim()
]

export const updateWorkspaceValidator = [
  param('workspace_id')
    .notEmpty().withMessage('El ID del workspace es obligatorio')
    .isMongoId().withMessage('ID de workspace inválido'),
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
  body('descripcion')
    .optional()
    .trim()
]

export const workspaceIdValidator = [
  param('workspace_id')
    .notEmpty().withMessage('El ID del workspace es obligatorio')
    .isMongoId().withMessage('ID de workspace inválido')
]

export const addMemberValidator = [
  param('workspace_id')
    .notEmpty().withMessage('El ID del workspace es obligatorio')
    .isMongoId().withMessage('ID de workspace inválido'),
  body('usuario_id')
    .notEmpty().withMessage('El ID del usuario es obligatorio')
    .isMongoId().withMessage('ID de usuario inválido')
]
