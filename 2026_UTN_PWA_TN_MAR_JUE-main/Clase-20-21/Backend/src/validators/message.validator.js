import { body, param, query } from 'express-validator'

export const sendMessageValidator = [
    param('workspace_id')
        .notEmpty().withMessage('El ID del workspace es obligatorio')
        .isMongoId().withMessage('ID de workspace inválido'),
    body('contenido')
        .trim()
        .notEmpty().withMessage('El contenido del mensaje es obligatorio')
]

export const getMessagesValidator = [
    param('workspace_id')
        .notEmpty().withMessage('El ID del workspace es obligatorio')
        .isMongoId().withMessage('ID de workspace inválido'),
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('La página debe ser un número positivo'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100')
]

export const deleteMessageValidator = [
    param('workspace_id')
        .notEmpty().withMessage('El ID del workspace es obligatorio')
        .isMongoId().withMessage('ID de workspace inválido'),
    param('message_id')
        .notEmpty().withMessage('El ID del mensaje es obligatorio')
        .isMongoId().withMessage('ID de mensaje inválido')
]
