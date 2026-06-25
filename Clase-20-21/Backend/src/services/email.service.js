import crypto from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mailer_transport from '../config/mailer.config.js'
import ENVIRONMENT from '../config/environment.config.js'
import userRepository from '../repositories/user.repository.js'
import ServerError from '../helpers/serverError.helper.js'

class EmailService {
  async sendForgotPassword(email) {
    if (!email) {
      throw new ServerError("El email es obligatorio.", 400)
    }

    const usuario = await userRepository.getByEmail(email)

    if (!usuario) {
      throw new ServerError("No existe una cuenta con ese email.", 404)
    }

    if (!usuario.email_verificado) {
      throw new ServerError("Debes verificar tu email antes de restablecer la contraseña.", 400)
    }

    const reset_token = crypto.randomBytes(32).toString('hex')
    const reset_token_expires = new Date(Date.now() + 3600000)

    await userRepository.updateById(usuario._id, {
      reset_token,
      reset_token_expires
    })

    await mailer_transport.sendMail({
      to: email,
      from: ENVIRONMENT.EMAIL_USER,
      subject: "Restablecer tu contraseña",
      html: `
        <h1>Restablecer tu contraseña</h1>
        <p>
          <a href="${ENVIRONMENT.URL_FRONTEND}/re_contrase_a?token=${reset_token}">
            Click aquí
          </a> para cambiar tu contraseña.
        </p>
        <p>Este link expira en 1 hora.</p>
      `
    })
  }

  async resetPassword(token, nueva_contrasena) {
    if (!token) {
      throw new ServerError("El token de recuperación es requerido o ha expirado.", 400)
    }

    if (!nueva_contrasena || nueva_contrasena.trim().length < 6) {
      throw new ServerError("La contraseña es obligatoria y debe tener al menos 6 caracteres.", 400)
    }

    const usuario = await userRepository.getByResetToken(token)

    if (!usuario) {
      throw new ServerError("El token no es válido o ya fue utilizado.", 404)
    }

    if (usuario.reset_token_expires && usuario.reset_token_expires < new Date()) {
      throw new ServerError("El token ha expirado. Solicitá uno nuevo.", 400)
    }

    const hashedPassword = await bcrypt.hash(nueva_contrasena, 10)

    await userRepository.updateById(usuario._id, {
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null
    })
  }

  async resendVerification(email) {
    const usuario = await userRepository.getByEmail(email)

    if (!usuario) {
      throw new ServerError("El correo no está registrado", 404)
    }

    if (usuario.email_verificado) {
      throw new ServerError("El email ya fue verificado", 400)
    }

    const verification_token = jwt.sign(
      { email },
      ENVIRONMENT.JWT_SECRET,
      { expiresIn: '1h' }
    )

    await mailer_transport.sendMail({
      to: email,
      from: ENVIRONMENT.EMAIL_USER,
      subject: "Verifica tu cuenta",
      html: `
        <div style="max-width:480px; margin:0 auto; background-color:#181c20; border:1px solid #30363d; border-radius:12px; padding:2.5rem; text-align:center; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <h1 style="color:#f0f3f6; font-size:1.5rem; font-weight:600; margin-bottom:1.5rem;">Verificación de cuenta</h1>
          <p style="color:#8b949e; font-size:0.95rem; line-height:1.5; margin-bottom:1.5rem;">Hacé clic en el botón para verificar tu cuenta.</p>
          <a href="${ENVIRONMENT.URL_FRONTEND}/verificacion_cuenta?verification_token=${verification_token}" style="display:inline-block; background-color:#58a6ff; color:#0f1214; text-decoration:none; font-weight:600; font-size:1rem; padding:0.8rem 2rem; border-radius:6px;">Verificar cuenta</a>
          <p style="color:#8b949e; font-size:0.85rem; line-height:1.5; margin-top:1.5rem;">Si no solicitaste esta verificación, ignorá este correo.</p>
        </div>
      `
    })
  }

  async sendInvitation(email) {
    const verification_token = "un-token-seguro-y-largo"

    await mailer_transport.sendMail({
      to: email,
      from: ENVIRONMENT.EMAIL_USER,
      subject: "quiere unirse a este workspace?",
      html: `
        <h1>Este es el link para que te unas al workspace</h1>
        <p>
          <a href="${ENVIRONMENT.URL_FRONTEND}/re_contrase_a?token=${verification_token}">
            Click aquí
          </a> .
        </p>
      `
    })
  }
}

const emailService = new EmailService()
export default emailService
