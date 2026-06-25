import messageRepository from '../repositories/message.repository.js'
import ServerError from '../helpers/serverError.helper.js'

class MessageService {

    async sendMessage(workspace_id, user_id, contenido) {
        if (!contenido || contenido.trim() === '') {
            throw new ServerError("El contenido del mensaje es obligatorio", 400)
        }

        return await messageRepository.create(workspace_id, user_id, contenido)
    }

    async getMessages(workspace_id, page = 1, limit = 50) {
        return await messageRepository.getByWorkspaceId(workspace_id, page, limit)
    }

    async deleteMessage(message_id, user_id, workspace_id) {
        const message = await messageRepository.getById(message_id)
        if (!message) {
            throw new ServerError("Mensaje no encontrado", 404)
        }

        if (message.fk_workspace_id.toString() !== workspace_id) {
            throw new ServerError("El mensaje no pertenece a este espacio de trabajo", 400)
        }

        if (message.fk_user_id.toString() !== user_id) {
            throw new ServerError("No puedes eliminar un mensaje que no te pertenece", 403)
        }

        await messageRepository.deleteById(message_id)
        return message
    }

}

const messageService = new MessageService()
export default messageService
