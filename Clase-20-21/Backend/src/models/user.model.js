import mongoose from 'mongoose'
import { WORKSPACE_COLLECTION_NAME } from './workspace.model.js'

const userSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        email_verificado: {
            type: Boolean,
            default: false,
            required: true
        },
        fecha_creacion: {
            type: Date,
            required: true,
            default: Date.now
        },
        activo: {
            type: Boolean,
            required: true,
            default: true
        },
        descripcion: {
            type: String,
            required: false
        },
        workspace_lista: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: WORKSPACE_COLLECTION_NAME
        }],
        reset_token: {
            type: String,
            default: null
        },
        reset_token_expires: {
            type: Date,
            default: null
        }
    }
)
export const USER_COLLECTION_NAME = 'User'
const User = mongoose.model(USER_COLLECTION_NAME, userSchema)

export default User