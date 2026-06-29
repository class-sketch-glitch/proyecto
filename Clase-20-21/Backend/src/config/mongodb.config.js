import mongoose from "mongoose"
import { ENVIRONMENT } from "./environment.config.js"
// Corregido: Si en tu archivo pusiste 'export const ENVIRONMENT', acá va con llaves {}
import dotenv from 'dotenv'

//Lee el archivo .env e inyecta las variables de entorno dentro de process.env
dotenv.config()

const connectMongoDB = async () => {
    try {
        // Alertas en consola por si te falta configurar alguna variable en el .env
        if (!ENVIRONMENT.MONGO_DB_CONNECTION_STRING) {
            throw new Error("Falta la variable MONGO_DB_CONNECTION_STRING en el entorno.");
        }

        // Armamos la URL limpia
        const connectionString = `${ENVIRONMENT.MONGO_DB_CONNECTION_STRING}/${ENVIRONMENT.MONGO_DB_NAME || ''}`;
        
        console.log("Intentando conectar a:", connectionString); // Esto te va a ayudar a ver si se arma bien

        await mongoose.connect(connectionString);
        
        console.log("¡La conexión con MongoDB funciona correctamente! 🚀");
    }
    catch (error) {
        console.error("Hubo un fallo en la conexión de la DB:", error.message);
    }
}

export default connectMongoDB;