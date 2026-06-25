import workspaceRepository from '../repositories/workspace.repository.js'
import workspaceMemberRepository from '../repositories/workspaceMember.repository.js'
import userRepository from '../repositories/user.repository.js'
import ServerError from '../helpers/serverError.helper.js'
import { MEMBER_WORKSPACE_ROLES } from '../constants/memberRoles.constant.js'

class WorkspaceService {
  async create(nombre, descripcion, user_id) {
    if (!nombre || nombre.trim() === '') {
      throw new ServerError("El nombre del espacio de trabajo es obligatorio", 400)
    }

    const newWorkspace = await workspaceRepository.create(nombre, descripcion || '')
    await workspaceMemberRepository.create(user_id, newWorkspace._id, MEMBER_WORKSPACE_ROLES.OWNER)
    await userRepository.addWorkspace(user_id, newWorkspace._id)

    return newWorkspace
  }

  async getById(workspace_id) {
    return await workspaceRepository.getById(workspace_id)
  }

  async getAllByUser(user_id) {
    return await workspaceMemberRepository.getByUserId(user_id)
  }

  async deleteById(workspace_id) {
    await workspaceRepository.softDeleteById(workspace_id)
  }

  async updateById(workspace_id, nombre, descripcion) {
    const updated_info = {}

    if (!nombre && !descripcion) {
      throw new ServerError("Debes enviar al menos un campo para actualizar", 400)
    }

    if (nombre) {
      if (nombre.length < 2) {
        throw new ServerError("El nombre debe tener al menos 2 caracteres", 400)
      }
      updated_info.nombre = nombre
    }

    if (descripcion) {
      updated_info.descripcion = descripcion
    }

    await workspaceRepository.updateById(workspace_id, updated_info)
    return await workspaceRepository.getById(workspace_id)
  }

  async addMember(workspace_id, usuario_id) {
    if (!usuario_id) {
      throw new ServerError("Debes proporcionar el ID del usuario", 400)
    }

    const existingMember = await workspaceMemberRepository.getByUserAndWorkspaceId(usuario_id, workspace_id)
    if (existingMember) {
      throw new ServerError("El usuario ya es miembro de este espacio de trabajo", 400)
    }

    return await workspaceMemberRepository.create(usuario_id, workspace_id, MEMBER_WORKSPACE_ROLES.USER)
  }
}

const workspaceService = new WorkspaceService()
export default workspaceService
