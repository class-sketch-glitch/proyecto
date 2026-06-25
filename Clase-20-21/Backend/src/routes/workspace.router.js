import express from 'express'
import workspaceController from '../controllers/workspace.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import workspaceMiddleware from '../middlewares/workspace.middleware.js'
import { createWorkspaceValidator, updateWorkspaceValidator, workspaceIdValidator, addMemberValidator } from '../validators/workspace.validator.js'
import validate from '../middlewares/validate.middleware.js'
import asyncHandler from '../helpers/asyncHandler.js'
import { MEMBER_WORKSPACE_ROLES } from '../constants/memberRoles.constant.js'

const workspaceRouter = express.Router()

workspaceRouter.post('/', authMiddleware, createWorkspaceValidator, validate, asyncHandler(workspaceController.create))
workspaceRouter.get('/', authMiddleware, asyncHandler(workspaceController.getAllByUser))
workspaceRouter.get('/:workspace_id', authMiddleware, workspaceIdValidator, validate, workspaceMiddleware([]), asyncHandler(workspaceController.getById))
workspaceRouter.delete('/:workspace_id', authMiddleware, workspaceIdValidator, validate, workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER]), asyncHandler(workspaceController.deleteById))
workspaceRouter.put('/:workspace_id', authMiddleware, updateWorkspaceValidator, validate, workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER, MEMBER_WORKSPACE_ROLES.ADMIN]), asyncHandler(workspaceController.updateById))
workspaceRouter.post('/:workspace_id/members', authMiddleware, addMemberValidator, validate, workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER, MEMBER_WORKSPACE_ROLES.ADMIN]), asyncHandler(workspaceController.addMember))

export default workspaceRouter
