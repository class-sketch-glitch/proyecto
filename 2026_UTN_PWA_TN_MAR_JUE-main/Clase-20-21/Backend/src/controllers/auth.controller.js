import authService from '../services/auth.service.js'

class AuthController {
  async register(req, res) {
    const { name, email, password } = req.body
    const result = await authService.register(name, email, password)

    return res.status(201).json({
      message: "Usuario registrado con éxito",
      ok: true,
      status: 201,
      data: {
        user: result.user
      }
    })
  }

  async verifyEmail(req, res) {
    const { verification_token } = req.query
    await authService.verifyEmail(verification_token)

    return res.status(200).json({
      ok: true,
      status: 200,
      message: "Email verificado correctamente. ¡Ya puedes usar tu cuenta!"
    })
  }

  async login(req, res) {
    const { email, password } = req.body
    const result = await authService.login(email, password)

    return res.status(200).json({
      ok: true,
      status: 200,
      message: 'Usuario autentificado exitosamente',
      data: {
        access_token: result.access_token
      }
    })
  }

  async findByEmail(req, res) {
    const { email } = req.body
    const result = await authService.findByEmail(email)

    return res.status(200).json({
      ok: true,
      status: 200,
      message: 'Usuario encontrado',
      data: {
        usuario: result
      }
    })
  }
}

const authController = new AuthController()
export default authController
