import Message from "../models/message.model.js"

class MessageRepository {

    async create(workspace_id, user_id, contenido) {
        return await Message.create({
            fk_workspace_id: workspace_id,
            fk_user_id: user_id,
            contenido
        })
    }

    async getByWorkspaceId(workspace_id, page = 1, limit = 50) {
        const skip = (page - 1) * limit
        const [data, total] = await Promise.all([
            Message.find({ fk_workspace_id: workspace_id })
                .sort({ fecha_creacion: -1 })
                .skip(skip)
                .limit(limit)
                .populate('fk_user_id', 'nombre email'),
            Message.countDocuments({ fk_workspace_id: workspace_id })
        ])
        return { data, total, page, totalPages: Math.ceil(total / limit) }
    }

    async getById(message_id) {
        return await Message.findById(message_id)
    }

    async deleteById(message_id) {
        return await Message.findByIdAndDelete(message_id)
    }

}

const messageRepository = new MessageRepository()
export default messageRepository
