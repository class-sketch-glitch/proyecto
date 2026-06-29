import workspaceService from '../services/workspace.service.js'

class WorkspaceController {
  async create(request, response) {
    const { nombre, descripcion } = request.body
    const user_id = request.user.id

    const newWorkspace = await workspaceService.create(nombre, descripcion, user_id)

    return response.status(201).json({
      ok: true,
      message: "Espacio de trabajo creado con éxito",
      data: {
        workspace: newWorkspace
      }
    })
  }

  async getById(req, res) {
    const workspace_id = req.params.workspace_id
    const workspace = await workspaceService.getById(workspace_id)

    return res.status(200).json({
      ok: true,
      message: "Espacio de trabajo obtenido",
      data: { workspace }
    })
  }

  async getAllByUser(req, res) {
    const user_id = req.user.id

    const workspaces = await workspaceService.getAllByUser(user_id)

    return res.status(200).json({
      ok: true,
      message: "Espacios de trabajo obtenidos",
      data: {
        workspaces
      }
    })
  }

  async deleteById(request, response) {
    const workspace_id = request.params.workspace_id

    await workspaceService.deleteById(workspace_id)

    return response.status(200).json({
      message: "Espacio de trabajo eliminado exitosamente",
      ok: true,
      status: 200
    })
  }

  async updateById(request, response) {
    const workspace_id = request.params.workspace_id
    const { nombre, descripcion } = request.body

    const workspace_after_update = await workspaceService.updateById(workspace_id, nombre, descripcion)

    return response.status(200).json({
      message: "Espacio de trabajo actualizado exitosamente",
      ok: true,
      status: 200,
      data: {
        workspace: workspace_after_update
      }
    })
  }

  async addMember(request, response) {
    const workspace_id = request.params.workspace_id
    const { usuario_id } = request.body

    const membership = await workspaceService.addMember(workspace_id, usuario_id)

    return response.status(201).json({
      ok: true,
      message: "Miembro agregado con éxito",
      data: { membership }
    })
  }
}

const workspaceController = new WorkspaceController()
export default workspaceController
