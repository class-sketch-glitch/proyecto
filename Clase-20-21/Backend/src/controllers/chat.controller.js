import messageService from '../services/message.service.js'
import { getIO } from '../helpers/socket.helper.js'

class ChatController {

    async sendMessage(request, response) {
        const workspace_id = request.workspace._id
        const user_id = request.user.id
        const { contenido } = request.body

        const message = await messageService.sendMessage(workspace_id, user_id, contenido)

        getIO().to(`workspace:${workspace_id}`).emit('message:new', message)

        return response.status(201).json({
            ok: true,
            message: "Mensaje enviado con éxito",
            data: { message }
        })
    }

    async getMessages(request, response) {
        const workspace_id = request.workspace._id
        const page = parseInt(request.query.page) || 1
        const limit = parseInt(request.query.limit) || 50

        const result = await messageService.getMessages(workspace_id, page, limit)

        return response.status(200).json({
            data: result.data,
            page: result.page,
            totalPages: result.totalPages,
            total: result.total
        })
    }

    async deleteMessage(request, response) {
        const workspace_id = request.workspace._id
        const message_id = request.params.message_id
        const user_id = request.user.id

        const message = await messageService.deleteMessage(message_id, user_id, workspace_id)

        getIO().to(`workspace:${workspace_id}`).emit('message:deleted', { message_id })

        return response.status(200).json({
            ok: true,
            message: "Mensaje eliminado con éxito"
        })
    }

}

const chatController = new ChatController()
export default chatController
