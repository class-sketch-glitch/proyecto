import express from 'express'
import chatController from '../controllers/chat.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import workspaceMiddleware from '../middlewares/workspace.middleware.js'
import { sendMessageValidator, getMessagesValidator, deleteMessageValidator } from '../validators/message.validator.js'
import validate from '../middlewares/validate.middleware.js'
import asyncHandler from '../helpers/asyncHandler.js'

const chatRouter = express.Router()

chatRouter.get('/:workspace_id/messages', authMiddleware, getMessagesValidator, validate, workspaceMiddleware([]), asyncHandler(chatController.getMessages))
chatRouter.post('/:workspace_id/messages', authMiddleware, sendMessageValidator, validate, workspaceMiddleware([]), asyncHandler(chatController.sendMessage))
chatRouter.delete('/:workspace_id/messages/:message_id', authMiddleware, deleteMessageValidator, validate, workspaceMiddleware([]), asyncHandler(chatController.deleteMessage))

export default chatRouter
