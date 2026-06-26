import mongoose from "mongoose";
import { WORKSPACE_COLLECTION_NAME } from "./workspace.model.js";
import { USER_COLLECTION_NAME } from "./user.model.js";

const messageSchema = new mongoose.Schema({
    fk_workspace_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: WORKSPACE_COLLECTION_NAME
    },
    fk_user_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: USER_COLLECTION_NAME
    },
    contenido: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        enum: ["mensaje", "archivo"],
        default: "mensaje"
    },
    fecha_creacion: {
        type: Date,
        default: Date.now,
        required: true
    }
})

messageSchema.index({ fk_workspace_id: 1, fecha_creacion: -1 })

export const MESSAGE_COLLECTION_NAME = "Message"
const Message = mongoose.model(MESSAGE_COLLECTION_NAME, messageSchema)

export default Message
