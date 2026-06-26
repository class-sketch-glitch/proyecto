import ENVIRONMENT from "../config/environment.config.js";
import ServerError from "../helpers/serverError.helper.js";
import jwt from 'jsonwebtoken'

function authMiddleware(request, response, next) {
  const authorization_header = request.headers.authorization
  if (!authorization_header) {
    throw new ServerError('No hay header de autorizacion', 401)
  }

  const authorization_token = authorization_header.split(' ')[1]
  if (!authorization_token) {
    throw new ServerError('No hay token de autorizacion', 401)
  }

  const user_info = jwt.verify(
    authorization_token,
    ENVIRONMENT.JWT_SECRET
  )

  request.user = user_info
  next()
}

export default authMiddleware
