import ServerError from "../helpers/serverError.helper.js";
import userRepository from "../repositories/user.repository.js";
import workspaceMemberRepository from "../repositories/workspaceMember.repository.js";

async function findby_mail(request, response, next) {
  const { email, workspace_id } = request.body;

  if (!email) {
    throw new ServerError("El email del usuario es obligatorio", 400);
  }

  if (!workspace_id) {
    throw new ServerError("El id del workspace es obligatorio", 400);
  }

  const usuario = await userRepository.getByEmail(email);

  if (!usuario) {
    throw new ServerError("No existe ningún usuario registrado con ese email", 404);
  }

  const existingMember = await workspaceMemberRepository.getByUserAndWorkspaceId(usuario._id, workspace_id);

  if (existingMember) {
    throw new ServerError("El usuario ya está unido a este workspace", 400);
  }

  request.targetUser = usuario;
  return next();
}

export default findby_mail