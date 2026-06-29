import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userRepository from '../repositories/user.repository.js'
import ServerError from '../helpers/serverError.helper.js'
import ENVIRONMENT from '../config/environment.config.js'
import mailer_transport from '../config/mailer.config.js'

class AuthService {
  async register(name, email, password) {
    if (!name || name.length <= 2) {
      throw new ServerError("Nombre debe ser mayor a 2 caracteres", 400)
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new ServerError("Email inválido", 400)
    }
    if (!password || password.length < 6) {
      throw new ServerError("Password debe tener al menos 6 caracteres", 400)
    }

    const existingUser = await userRepository.getByEmail(email)
    if (existingUser) {
      throw new ServerError("El email ya está registrado", 400)
    }

    const hashed_password = await bcrypt.hash(password, 12)
    const newUser = await userRepository.create(name, email, hashed_password)

    const verification_token = jwt.sign(
      { email },
      ENVIRONMENT.JWT_SECRET,
      { expiresIn: '1h' }
    )

    await mailer_transport.sendMail({
      to: email,
      from: ENVIRONMENT.EMAIL_USER,
      subject: "Verifica tu mail",
      html: `
        <div style="max-width:480px; margin:0 auto; background-color:#181c20; border:1px solid #30363d; border-radius:12px; padding:2.5rem; text-align:center; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <h1 style="color:#f0f3f6; font-size:1.5rem; font-weight:600; margin-bottom:1rem;">Bienvenido a SLACK</h1>
          <p style="color:#8b949e; font-size:0.95rem; line-height:1.5; margin-bottom:1.5rem;">Hacé clic en el botón para verificar tu cuenta.</p>
          <a href="${ENVIRONMENT.URL_FRONTEND}/verificacion?verification_token=${verification_token}" style="display:inline-block; background-color:#58a6ff; color:#0f1214; text-decoration:none; font-weight:600; font-size:1rem; padding:0.8rem 2rem; border-radius:6px;">Verificar cuenta</a>
          <p style="color:#8b949e; font-size:0.85rem; line-height:1.5; margin-top:1.5rem;">Si no te registraste en SLACK, ignorá este correo.</p>
        </div>
      `
    })

    return {
      user: {
        id: newUser._id,
        name: newUser.nombre,
        email: newUser.email
      }
    }
  }

  async verifyEmail(verification_token) {
    if (!verification_token) {
      throw new ServerError("Falta token de verificación", 400)
    }

    const payload = jwt.verify(verification_token, ENVIRONMENT.JWT_SECRET)
    const { email } = payload
    const user = await userRepository.getByEmail(email)

    if (!user) {
      throw new ServerError("Usuario no encontrado", 404)
    }

    if (user.email_verificado) {
      throw new ServerError("Este email ya ha sido verificado", 400)
    }

    await userRepository.updateById(user._id, { email_verificado: true })
  }

  async login(email, password) {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new ServerError("Email inválido", 400)
    }

    if (!password || password.length < 6) {
      throw new ServerError("Contraseña invalida", 400)
    }

    const user_found = await userRepository.getByEmail(email)

    if (!user_found) {
      throw new ServerError("Usuario no registrado", 404)
    }

    if (!user_found.email_verificado) {
      throw new ServerError("Usuario con verificacion de mail pendiente", 401)
    }

    const is_same_password = await bcrypt.compare(password, user_found.password)

    if (!is_same_password) {
      throw new ServerError("Credenciales invalidas", 401)
    }

    const profile_info = {
      nombre: user_found.nombre,
      email: user_found.email,
      id: user_found._id,
      fecha_creacion: user_found.fecha_creacion
    }

    const access_token = jwt.sign(
      profile_info,
      ENVIRONMENT.JWT_SECRET,
      { expiresIn: '1h' }
    )

    return { access_token }
  }

  async getProfile(user_id) {
    const user = await userRepository.getProfile(user_id)

    if (!user) {
      throw new ServerError("Usuario no encontrado", 404)
    }

    return {
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      fecha_creacion: user.fecha_creacion,
      email_verificado: user.email_verificado,
      descripcion: user.descripcion,
      workspace_lista: user.workspace_lista
    }
  }

  async deleteAccount(user_id) {
    await userRepository.deleteById(user_id)
  }

  async findByEmail(email) {
    const user = await userRepository.getByEmail(email)
    if (!user) {
      throw new ServerError("Usuario no encontrado", 404)
    }
    return {
      _id: user._id,
      nombre: user.nombre,
      email: user.email
    }
  }
}

const authService = new AuthService()
export default authService
