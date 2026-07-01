import mongoose from "mongoose"
import { ENVIRONMENT } from "./environment.config.js"
import dotenv from 'dotenv'

dotenv.config()

const connectMongoDB = async () => {
    try {
        // Prioridad 1: Atlas (producción/Vercel) - MONGO_ATLAS_URI
        // Prioridad 2: Local (desarrollo) - MONGO_DB_CONNECTION_STRING
        const atlasUri = process.env.MONGO_ATLAS_URI
        const localUri = ENVIRONMENT.MONGO_DB_CONNECTION_STRING
        const dbName = ENVIRONMENT.MONGO_DB_NAME || 'email_confirmacion'

        let connectionString = ''

        if (atlasUri) {
            // Atlas: la URI ya incluye la DB, solo agregar si no la tiene
            connectionString = atlasUri.includes('mongodb.net/') && !atlasUri.includes('mongodb.net/?') 
                ? `${atlasUri}/${dbName}?retryWrites=true&w=majority`
                : atlasUri
            console.log("🔌 Conectando a MongoDB Atlas...")
        } else if (localUri) {
            // Local: formato mongodb://host:port/dbname
            connectionString = `${localUri}/${dbName}`
            console.log("🔌 Conectando a MongoDB Local...")
        } else {
            throw new Error("Falta MONGO_ATLAS_URI (producción) o MONGO_DB_CONNECTION_STRING (local)")
        }

        await mongoose.connect(connectionString)
        console.log("✅ ¡Conexión a MongoDB exitosa!")
    }
    catch (error) {
        console.error("❌ Error conectando a MongoDB:", error.message)
        // En Vercel no crashear el proceso, solo logear
        if (process.env.VERCEL !== '1') {
            process.exit(1)
        }
    }
}

export default connectMongoDB;