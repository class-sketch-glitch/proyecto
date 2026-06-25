import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Nos aseguramos DE VERDAD de que levante el archivo .env antes de configurar nada
dotenv.config(); 

console.log("=== CHECK DE MAILER (MOMENTO DE ARRANQUE) ===");
console.log("EMAIL_USER listo:", !!process.env.EMAIL_USER);
console.log("EMAIL_CONTRASEÑA listo:", !!process.env.EMAIL_PASSWORD );
console.log("=============================================");

const mailer_transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        // Leemos directo de process.env para saltear cualquier problema de puentes
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASSWORD 
    }
});

export default mailer_transport;