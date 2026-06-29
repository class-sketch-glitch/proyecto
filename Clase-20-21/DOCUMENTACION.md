# Documentación del Proyecto

Aplicación estilo Slack para gestión de espacios de trabajo, con autenticación, verificación por email, recuperación de contraseña e invitaciones.

---

## Índice

1. [Stack Tecnológico](#1-stack-
tecnológico)
2. [Estructura del Proyecto](#2-estructura-del-proyecto)
3. [Backend - API REST](#3-backend---api-rest)
   - [Configuración y Entorno](#31-configuración-y-entorno)
   - [Modelos de Datos](#32-modelos-de-datos)
   - [Rutas y Endpoints](#33-rutas-y-endpoints)
   - [Controladores](#34-controladores)
   - [Repositorios](#35-repositorios)
   - [Middlewares](#36-middlewares)
   - [Helpers](#37-helpers)
4. [Frontend - React SPA](#4-frontend---react-spa)
   - [Enrutamiento](#41-enrutamiento)
   - [Pantallas](#42-pantallas)
   - [Servicios](#43-servicios)
   - [Hooks y Helpers](#44-hooks-y-helpers)
5. [Flujo de Autenticación](#5-flujo-de-autenticación)
6. [Flujo de Recuperación de Contraseña](#6-flujo-de-recuperación-de-contraseña)
7. [Flujo de Espacios de Trabajo](#7-flujo-de-espacios-de-trabajo)
8. [Manejo de Errores](#8-manejo-de-errores)
9. [Variables de Entorno](#9-variables-de-entorno)

---

## 1. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express 5 |
| Base de datos | MongoDB + Mongoose 9 |
| Autenticación | JWT + bcrypt |
| Envío de emails | Nodemailer (Gmail SMTP) |
| Frontend | React 19 + Vite |
| Enrutamiento frontend | React Router |
| Lenguaje | JavaScript (ES Modules) |

---

## 2. Estructura del Proyecto

```
Clase-20-21/
├── Backend/
│   ├── src/
│   │   ├── main.js                    # Punto de entrada del servidor
│   │   ├── config/
│   │   │   ├── environment.config.js  # Variables de entorno
│   │   │   ├── mongodb.config.js      # Conexión a MongoDB
│   │   │   └── mailer.config.js       # Transporte de Nodemailer
│   │   ├── routes/
│   │   │   ├── auth.router.js         # Rutas de autenticación
│   │   │   └── workspace.router.js    # Rutas de workspaces
│   │   ├── controllers/
│   │   │   ├── auth.controller.js     # register, login, verifyEmail
│   │   │   ├── workspace.controller.js# CRUD de workspaces + miembros
│   │   │   ├── Email_verificador.js   # Enviar email de reset password
│   │   │   ├── resetPassword_Router.js# Cambiar contraseña con token
│   │   │   ├── mail_verificacion.js   # Reenviar email de verificación
│   │   │   └── mail_invitacion.js     # Enviar invitación a workspace
│   │   ├── models/
│   │   │   ├── user.model.js          # Schema de Usuario
│   │   │   ├── workspace.model.js     # Schema de Workspace
│   │   │   └── workspaceMembers.model.js # Schema de Membresía
│   │   ├── repositories/
│   │   │   ├── user.repository.js     # Operaciones DB de usuarios
│   │   │   ├── workspace.repository.js# Operaciones DB de workspaces
│   │   │   └── workspaceMember.repository.js # Operaciones DB de membresías
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js      # Verificación de JWT
│   │   │   ├── errorHandler.middleware.js # Manejador global de errores
│   │   │   ├── workspace.middleware.js # Validación de membresía y roles
│   │   │   └── findby_mail.js         # Buscar usuario por email
│   │   ├── helpers/
│   │   │   ├── asyncHandler.js        # Wrapper para async/await
│   │   │   └── serverError.helper.js  # Clase ServerError personalizada
│   │   └── constants/
│   │       └── memberRoles.constant.js # Roles: dueño, admin, usuario
│   ├── .env                           # Variables de entorno
│   └── package.json
│
├── Frontend/
│   └── src/
│       ├── App.jsx                    # Configuración de rutas
│       ├── Screens/
│       │   ├── LoginScreen/LoginScreen.jsx
│       │   ├── RegisterScreen/RegisterScreen.jsx
│       │   └── HomeScreen/HomeScreen.jsx
│       ├── cambio_contraseña/
│       │   ├── Pantalla_cambio_contraseña.jsx  # Formulario "olvidé mi contraseña"
│       │   └── Re_contraseña.jsx               # Formulario para nueva contraseña
│       ├── verificacion/VerificacionScreen.jsx  # Verificación de email
│       ├── invitacion/BuscadorInvitacion.jsx    # Búsqueda de usuarios para invitar
│       ├── services/
│       │   ├── httpClient.js          # Cliente HTTP base
│       │   └── authService.js         # Servicios de autenticación
│       ├── hooks/useForm.jsx          # Hook genérico para formularios
│       └── helpers/asyncHandler.js    # Wrapper para async/await
```

---

## 3. Backend - API REST

### 3.1 Configuración y Entorno

**`config/environment.config.js`**
- Carga las variables del archivo `.env` usando `dotenv`.
- Exporta un objeto `ENVIRONMENT` con todas las configuraciones:
  - `PORT` - Puerto del servidor
  - `MONGO_DB_CONNECTION_STRING` - URI de MongoDB
  - `MONGO_DB_NAME` - Nombre de la base de datos
  - `EMAIL_USER` - Correo Gmail para envíos
  - `EMAIL_PASSWORD` - Contraseña de aplicación de Gmail
  - `URL_FRONTEND` - URL del frontend (para links en emails)
  - `URL_BACKEND` - URL del backend
  - `JWT_SECRET` - Secreto para firmar tokens JWT

**`config/mongodb.config.js`**
- Conecta a MongoDB usando Mongoose.
- Construye la connection string combinando `MONGO_DB_CONNECTION_STRING` + `MONGO_DB_NAME`.
- Maneja errores de conexión.

**`config/mailer.config.js`**
- Configura Nodemailer con el servicio Gmail.
- Usa `EMAIL_USER` y `EMAIL_PASSWORD` de `process.env` para la autenticación SMTP.
- Exporta el transporter listo para usar.

### 3.2 Modelos de Datos

**User (`models/user.model.js`)**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | String (required) | Nombre del usuario |
| `email` | String (required, unique) | Correo electrónico |
| `password` | String (required) | Hash bcrypt de la contraseña |
| `email_verificado` | Boolean (default: false) | Indica si el email fue verificado |
| `fecha_creacion` | Date (default: Date.now) | Fecha de registro |
| `activo` | Boolean (default: true) | Soft delete |
| `descripcion` | String | Descripción opcional del perfil |
| `workspace_lista` | [ObjectId] (ref: Workspace) | Lista de workspaces del usuario |
| `reset_token` | String (default: null) | Token para reset de contraseña |
| `reset_token_expires` | Date (default: null) | Fecha de expiración del token |

**Workspace (`models/workspace.model.js`)**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | String (required) | Nombre del espacio de trabajo |
| `fecha_creacion` | Date (default: Date.now) | Fecha de creación |
| `descripcion` | String | Descripción opcional |
| `estado` | Boolean (default: true) | Soft delete |
| `usuarios_lista` | Array | Lista de usuarios (sin uso activo) |

**WorkspaceMember (`models/workspaceMembers.model.js`)**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `fk_workspace_id` | ObjectId (ref: Workspace) | Referencia al workspace |
| `fk_user_id` | ObjectId (ref: User) | Referencia al usuario |
| `fecha_creacion` | Date (default: Date.now) | Fecha de unión |
| `rol` | String (enum: dueño, admin, usuario) | Rol dentro del workspace |

### 3.3 Rutas y Endpoints

**Rutas de Autenticación (`/api/auth`)**

| Método | Ruta | Middleware | Controlador | Descripción |
|--------|------|-----------|-------------|-------------|
| POST | `/api/auth/register` | - | `authController.register` | Registrar nuevo usuario |
| GET | `/api/auth/verify-email` | - | `authController.verifyEmail` | Verificar email con token |
| POST | `/api/auth/login` | - | `authController.login` | Iniciar sesión |
| POST | `/api/auth/forgot-password` | - | `Email_verificador` | Solicitar restablecimiento de contraseña |
| POST | `/api/auth/reset-password` | - | `resetPassword_Router` | Cambiar contraseña con token |
| POST | `/api/auth/mail_verificacion` | - | `mail_verificacion` | Reenviar email de verificación |
| POST | `/api/auth/email_invitacion` | - | `mail_invitacion` | Enviar invitación a workspace |

**Rutas de Workspace (`/api/workspace`)**

| Método | Ruta | Middleware | Controlador | Descripción |
|--------|------|-----------|-------------|-------------|
| POST | `/api/workspace` | authMiddleware | `workspaceController.create` | Crear workspace |
| GET | `/api/workspace` | authMiddleware | `workspaceController.getAllByUser` | Listar workspaces del usuario |
| DELETE | `/api/workspace/:workspace_id` | authMiddleware | `workspaceController.deleteById` | Eliminar workspace (soft delete) |
| PUT | `/api/workspace/:workspace_id` | authMiddleware | `workspaceController.updateById` | Actualizar workspace |
| POST | `/api/workspace/:workspace_id/members` | authMiddleware | `workspaceController.addMember` | Agregar miembro |

**Rutas de Perfil (`/api/profile`)**

| Método | Ruta | Middleware | Descripción |
|--------|------|-----------|-------------|
| GET | `/api/profile` | authMiddleware | Obtener perfil del usuario autenticado |
| DELETE | `/api/profile` | authMiddleware | Eliminar cuenta del usuario autenticado |

### 3.4 Controladores

**`auth.controller.js`** (clase `AuthController`)

- **`register(req, res)`**:
  1. Valida name > 2 chars, email con regex, password >= 6 chars.
  2. Verifica que el email no esté registrado.
  3. Hashea la contraseña con bcrypt (12 rounds).
  4. Crea el usuario en DB.
  5. Genera un JWT `{ email }` con expiración de 1 hora.
  6. Envía email de verificación con link al frontend.
  7. Retorna 201 con datos del usuario.

- **`verifyEmail(req, res)`**:
  1. Extrae `verification_token` de query params.
  2. Verifica el JWT y extrae el email.
  3. Busca al usuario por email.
  4. Si no está verificado, marca `email_verificado: true`.
  5. Retorna mensaje de éxito.

- **`login(req, res)`**:
  1. Valida email y password.
  2. Busca usuario por email (debe existir y estar activo).
  3. Verifica que `email_verificado === true`.
  4. Compara contraseña con bcrypt.
  5. Genera JWT con `{ nombre, email, id, fecha_creacion }`.
  6. Retorna `{ access_token }`.

**`workspace.controller.js`** (clase `WorkspaceController`)

- **`create(req, res)`**:
  1. Valida nombre del workspace.
  2. Crea el workspace en DB.
  3. Crea una membresía con rol `dueño` para el creador.
  4. Agrega el workspace a la lista del usuario.
  5. Retorna 201.

- **`getAllByUser(req, res)`**:
  1. Busca todas las membresías del usuario.
  2. Populate para traer datos del workspace.
  3. Filtra solo workspaces activos.
  4. Retorna lista mapeada.

- **`deleteById(req, res)`**: Soft delete del workspace (cambia `estado: false`).

- **`updateById(req, res)`**: Actualiza nombre y/o descripción del workspace.

- **`addMember(req, res)`**:
  1. Valida que se proporcione `usuario_id`.
  2. Verifica que el usuario no sea ya miembro.
  3. Crea membresía con rol `usuario`.

**`Email_verificador.js`** (router independiente)

- **`POST /`**:
  1. Valida que el email esté presente.
  2. Busca usuario activo por email.
  3. Verifica que el email esté verificado.
  4. Genera token criptográfico seguro con `crypto.randomBytes(32)`.
  5. Guarda el token y su expiración (1 hora) en el usuario.
  6. Envía email con link: `{URL_FRONTEND}/re_contrase_a?token={token}`.

**`resetPassword_Router.js`** (router independiente)

- **`POST /`**:
  1. Valida token y nueva contraseña (>= 6 chars).
  2. Busca usuario por `reset_token`.
  3. Verifica que el token no haya expirado.
  4. Hashea la nueva contraseña con bcrypt (10 rounds).
  5. Actualiza la contraseña y limpia `reset_token` y `reset_token_expires`.

**`mail_verificacion.js`** (router independiente)

- **`POST /`**: Reenvía el email de verificación para usuarios que no verificaron su email.

**`mail_invitacion.js`** (router independiente)

- **`POST /`**: Envía un email de invitación a un workspace (usa un token hardcodeado).

### 3.5 Repositorios

Patrón repositorio para separar la lógica de acceso a datos.

**`user.repository.js`**
- `getAll()` - Obtener todos los usuarios activos
- `getById(user_id)` - Obtener usuario por ID
- `create(nombre, email, password)` - Crear nuevo usuario
- `getByEmail(email)` - Buscar usuario por email (solo activos)
- `deleteById(user_id)` - Hard delete de usuario
- `updateById(user_id, update_data)` - Actualizar campos del usuario
- `addWorkspace(user_id, workspace_id)` - Agregar workspace a la lista del usuario
- `removeWorkspace(user_id, workspace_id)` - Remover workspace de la lista
- `getProfile(user_id)` - Obtener perfil con populate de workspaces

**`workspace.repository.js`**
- `getAll()` - Obtener workspaces activos
- `getById(workspace_id)` - Obtener workspace por ID
- `create(nombre, descripcion)` - Crear workspace
- `softDeleteById(workspace_id)` - Soft delete (estado: false)
- `deleteById(workspace_id)` - Hard delete
- `updateById(workspace_id, update_data)` - Actualizar workspace

**`workspaceMember.repository.js`**
- `getByUserAndWorkspaceId(user_id, workspace_id)` - Buscar membresía específica
- `create(user_id, workspace_id, rol)` - Crear membresía
- `getById(member_id)` - Obtener membresía por ID
- `updateById(member_id, update_data)` - Actualizar membresía
- `deleteById(member_id)` - Eliminar membresía
- `getByWorkspaceId(workspace_id)` - Listar miembros de un workspace con populate
- `getByUserId(user_id)` - Listar workspaces de un usuario con populate

### 3.6 Middlewares

**`auth.middleware.js`**
- Extrae el header `Authorization: Bearer <token>`.
- Verifica el JWT con `JWT_SECRET`.
- Adjunta `request.user` con los datos decodificados.
- Lanza 401 si falta el header o el token es inválido.

**`workspace.middleware.js`**
- Factory function que acepta `valid_roles[]`.
- Valida que `workspace_id` esté presente en params.
- Verifica que el workspace exista.
- Verifica que el usuario sea miembro del workspace.
- Si se especificaron roles, verifica que el miembro tenga uno de ellos.
- Adjunta `request.workspace` y `request.membership`.

**`findby_mail.js`**
- Middleware para buscar un usuario por email (para invitaciones).
- Valida que email y workspace_id estén presentes.
- Busca usuario por email (debe existir).
- Verifica que no sea ya miembro del workspace.
- Adjunta `request.targetUser`.

**`errorHandler.middleware.js`**
- Middleware global de errores (4 parámetros).
- Maneja: errores con `status`, ValidationError, CastError, errores de duplicado (11000), JWT errors.
- Devuelve respuesta JSON con `{ ok, status, message }`.
- Los errores no reconocidos devuelven 500.

### 3.7 Helpers

**`asyncHandler.js`**
- Envuelve funciones async para que Express maneje los errores automáticamente con `next()`.

**`serverError.helper.js`**
- Clase `ServerError` que extiende `Error` con una propiedad `status` adicional.
- Permite lanzar errores con código HTTP personalizado.

---

## 4. Frontend - React SPA

### 4.1 Enrutamiento (`App.jsx`)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `LoginScreen` | Página de inicio de sesión |
| `/login` | `LoginScreen` | Página de inicio de sesión |
| `/register` | `RegisterScreen` | Página de registro |
| `/home` | `HomeScreen` | Perfil y gestión de workspaces |
| `/olvido_su_contraseña` | `Pantalla_cambio_contraseña` | Formulario para solicitar reset de contraseña |
| `/re_contrase_a` | `Re_contraseña` | Formulario para establecer nueva contraseña |
| `/verificacion` | `VerificacionScreen` | Verificación de email |
| `/invitar` | `BuscadorInvitacion` | Buscar usuarios para invitar a workspace |
| `/*` | Redirect a `/home` | Catch-all |

### 4.2 Pantallas

**`LoginScreen.jsx`**
- Formulario con email y contraseña.
- Usa el hook `useForm` para manejo del estado.
- Llama a `authService.login()`.
- En caso de éxito, guarda el token en `localStorage` y redirige a `/home`.
- Muestra enlaces a registro y "olvidé mi contraseña".

**`RegisterScreen.jsx`**
- Formulario con nombre, email y contraseña.
- Llama a `authService.register()`.
- En caso de éxito, muestra pantalla de confirmación con instrucciones para verificar email.

**`HomeScreen.jsx`**
- Protegida: redirige a `/login` si no hay token.
- Decodifica el JWT para información básica del usuario.
- Carga el perfil completo desde `GET /api/profile`.
- Muestra datos del usuario (nombre, email, ID, fecha de creación).
- Botón "Cerrar sesión": limpia el token y redirige a `/login`.
- Botón "Eliminar sesión": confirma con `window.confirm`, luego llama a `DELETE /api/profile`, limpia el token y redirige a `/login`.
- Sección de workspaces:
  - Lista los workspaces del usuario.
  - Formulario para crear nuevo workspace (nombre + descripción opcional).
  - Botón "+ Nuevo" para mostrar/ocultar el formulario.

**`Pantalla_cambio_contraseña.jsx`**
- Formulario que pide el email del usuario.
- Llama a `POST /api/auth/forgot-password`.
- Muestra mensaje de éxito o error.

**`Re_contraseña.jsx`**
- Lee el token de la URL (`?token=...`).
- Formulario para ingresar la nueva contraseña.
- Llama a `POST /api/auth/reset-password` con token y nueva contraseña.
- Muestra mensaje de éxito o error.

**`VerificacionScreen.jsx`**
- Lee `verification_token` de la URL.
- Llama a `GET /api/auth/verify-email?verification_token=...`.
- Muestra mensaje de verificación exitosa o error.

**`BuscadorInvitacion.jsx`**
- Formulario para buscar usuarios por email e invitarlos a un workspace.
- Usa el middleware `findby_mail` del backend.

### 4.3 Servicios

**`httpClient.js`**
- Función wrapper alrededor de `fetch`.
- Base URL configurable (por defecto `http://localhost:8080/api`).
- Soporta método, body, y token de autenticación.
- Maneja errores de red y respuestas no-OK.

**`authService.js`**
- `login(email, password)` - Llama a `POST /api/auth/login`.
- `register(name, email, password)` - Llama a `POST /api/auth/register`.

### 4.4 Hooks y Helpers

**`useForm.jsx`**
- Hook genérico para manejo de formularios.
- Estado inicial, handler de cambios, handler de submit.
- Recibe un callback `onSubmit` que se ejecuta con los datos del formulario.

**`asyncHandler.js`** (frontend)
- Helper para envolver funciones async en componentes React.

---

## 5. Flujo de Autenticación

```
Registro:
  Usuario → POST /api/auth/register { name, email, password }
    → Backend valida datos
    → Hashea contraseña con bcrypt
    → Crea usuario en MongoDB
    → Genera JWT de verificación { email } (1h exp)
    → Envía email con link de verificación
    → Retorna 201

Verificación de Email:
  Usuario → Click en link del email → GET /api/auth/verify-email?verification_token=...
    → Backend verifica JWT
    → Marca email_verificado: true
    → Retorna mensaje de éxito

Inicio de Sesión:
  Usuario → POST /api/auth/login { email, password }
    → Backend valida credenciales
    → Verifica email_verificado === true
    → Compara password con bcrypt
    → Genera JWT de acceso { nombre, email, id, fecha_creacion }
    → Retorna { access_token }
  
  Frontend → Guarda access_token en localStorage
    → Redirige a /home
```

## 6. Flujo de Recuperación de Contraseña

```
Solicitud de Reset:
  Usuario → POST /api/auth/forgot-password { email }
    → Backend valida que el email exista y esté verificado
    → Genera token criptográfico (crypto.randomBytes(32))
    → Guarda reset_token + reset_token_expires (1h) en el usuario
    → Envía email con link: /re_contrase_a?token={reset_token}

Cambio de Contraseña:
  Usuario → Click en link → /re_contrase_a?token=...
    → Ingresa nueva contraseña
    → POST /api/auth/reset-password { token, nueva_contrasena }
    → Backend busca usuario por reset_token
    → Verifica que el token no haya expirado
    → Hashea nueva contraseña con bcrypt
    → Actualiza password y limpia reset_token
    → Retorna éxito
```

## 7. Flujo de Espacios de Trabajo

```
Creación:
  Usuario autenticado → POST /api/workspace { nombre, descripcion }
    → Crea workspace en DB
    → Crea membresía con rol "dueño" para el creador
    → Agrega workspace a la lista del usuario

Listado:
  Usuario autenticado → GET /api/workspace
    → Busca membresías del usuario
    → Populate datos del workspace
    → Retorna solo workspaces activos

Actualización:
  Usuario autenticado → PUT /api/workspace/:id { nombre, descripcion }
    → Actualiza campos del workspace

Eliminación:
  Usuario autenticado → DELETE /api/workspace/:id
    → Soft delete (estado: false)

Agregar Miembro:
  Usuario autenticado → POST /api/workspace/:id/members { usuario_id }
    → Crea membresía con rol "usuario"
```

## 8. Manejo de Errores

El backend usa un middleware global `errorHandler.middleware.js` que captura todos los errores y devuelve respuestas JSON consistentes:

```json
{ "ok": false, "status": 400, "message": "Descripción del error" }
```

| Tipo de Error | Código | Descripción |
|--------------|--------|-------------|
| ServerError con status | Según el error | Errores controlados (validación, no encontrado, etc.) |
| ValidationError | 400 | Error de validación de Mongoose |
| CastError | 400 | ID de MongoDB inválido |
| Código 11000 | 409 | Duplicado (email ya registrado) |
| JsonWebTokenError / TokenExpiredError | 401 | Token inválido o expirado |
| Error no reconocido | 500 | Error interno del servidor |

## 9. Variables de Entorno


```

Frontend (`config.js` o `.env`): define `URL_FRONTEND` y la URL base de la API.
