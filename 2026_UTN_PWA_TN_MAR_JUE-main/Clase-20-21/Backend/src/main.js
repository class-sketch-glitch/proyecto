import dotenv from 'dotenv';
dotenv.config();

import ENVIRONMENT from "./config/environment.config.js";
import connectMongoDB from "./config/mongodb.config.js";
import express from "express";


import dns from 'dns';
import authRouter from "./routes/auth.router.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import authService from "./services/auth.service.js";
import workspaceRouter from "./routes/workspace.router.js";
import Email_verificador from "./controllers/Email_verificador.js"
import mail_verificacion from "./controllers/mail_verificacion.js"

if(ENVIRONMENT.MODE === 'development'){
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

connectMongoDB()




const app = express();
const PORT = process.env.PORT || ENVIRONMENT.PORT || 3000;

// Habilitamos las consultas cross-origin
app.use(cors())

// Parse JSON
app.use(express.json());
app.get('/', (req, res) => {
    return res.status(200).json({
        ok: true,
        message: "¡Servidor corriendo con éxito en Vercel!",
        environment: process.env.NODE_ENV || "production",
        timestamp: new Date()
    });
});
app.use('/api/auth', authRouter);
app.use('/api/workspace', workspaceRouter)
app.use('/api/workspace', chatRouter)
app.use('/api/auth/forgot-password',Email_verificador)
app.use('/api/auth/reset-password', resetPassword_Router);
app.use('/api/auth/email_invitacion',mail_invitacion);
app.use('/api/auth/mail_verificacion', mail_verificacion);





app.get(
    '/api/profile', 
    authMiddleware,
    asyncHandler(async (request, response) => {
        const profile = await authService.getProfile(request.user.id)
        return response.json({
            ok: true,
            status: 200,
            data: profile
        })
    })
)

app.delete(
    '/api/profile',
    authMiddleware,
    asyncHandler(async (request, response) => {
        await authService.deleteAccount(request.user.id)
        return response.json({ ok: true, message: "Cuenta eliminada correctamente." })
    })
)

app.use(errorHandler)

// Exportar para Vercel serverless
export default app;

// Solo escuchar en desarrollo local (no en Vercel)
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || ENVIRONMENT.PORT || 3000;
  app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};


