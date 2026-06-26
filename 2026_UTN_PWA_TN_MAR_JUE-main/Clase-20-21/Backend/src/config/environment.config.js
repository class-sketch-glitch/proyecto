import dotenv from 'dotenv';
dotenv.config();

// 1. Esto le sirve a los archivos que usan llaves {}
export const ENVIRONMENT = {
    PORT: process.env.PORT || 3000,
    MONGO_DB_CONNECTION_STRING: process.env.MONGO_DB_CONNECTION_STRING,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    URL_FRONTEND: process.env. URL_FRONTEND,
    URL_BACKEND: process.env.URL_BACKEND,
    JWT_SECRET: process.env.JWT_SECRET
};

// 2. ¡LA LÍNEA MÁGICA! Esto le sirve a los archivos que NO usan llaves
export default ENVIRONMENT;