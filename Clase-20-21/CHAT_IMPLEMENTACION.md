# Implementación de Chat entre Usuarios

Documentación de la arquitectura propuesta para agregar un chat a la aplicación estilo Slack.

---

## Índice

1. [Modelos de Datos](#1-modelos-de-datos)
2. [Rutas y Endpoints](#2-rutas-y-endpoints)
3. [Controladores](#3-controladores)
4. [Repositorios](#4-repositorios)
5. [Comunicación en Tiempo Real (Socket.io)](#5-comunicación-en-tiempo-real-socketio)
6. [Frontend - Pantallas y Servicios](#6-frontend---pantallas-y-servicios)
7. [Resumen de Archivos Nuevos](#7-resumen-de-archivos-nuevos)

---

## 1. Modelos de Datos

### Message (`models/message.model.js`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `fk_workspace_id` | ObjectId (ref: Workspace) | Sala de chat (es el workspace) |
| `fk_user_id` | ObjectId (ref: User) | Autor del mensaje |
| `contenido` | String (required) | Texto del mensaje |
| `tipo` | String (enum: mensaje, archivo, default: mensaje) | Para soportar adjuntos a futuro |
| `fecha_creacion` | Date (default: Date.now) | Timestamp del mensaje |

**Relaciones:**
- `fk_workspace_id` → referencia a `Workspace` (el workspace funciona como canal/sala)
- `fk_user_id` → referencia a `User` (autor del mensaje)

**Índices:**
- `{ fk_workspace_id: 1, fecha_creacion: -1 }` para paginación optimizada

**Nota:** No se necesita un modelo `Channel` separado. El workspace mismo es la sala de chat. Para mensajes directos entre 2 usuarios se necesitaría un modelo aparte (DM), pero no está contemplado en esta implementación.

---

## 2. Rutas y Endpoints

Se agrega un nuevo archivo `routes/chat.router.js` montado en `main.js` como `/api/chat` o directamente integrado en `workspace.router.js`.

### Rutas de Chat (`/api/workspace/:workspace_id/messages`)

| Método | Ruta | Middleware | Controlador | Descripción |
|--------|------|-----------|-------------|-------------|
| GET | `/api/workspace/:workspace_id/messages` | authMiddleware + workspaceMiddleware | `chatController.getMessages` | Obtener mensajes del workspace (paginado) |
| POST | `/api/workspace/:workspace_id/messages` | authMiddleware + workspaceMiddleware | `chatController.sendMessage` | Enviar un mensaje al workspace |
| DELETE | `/api/workspace/:workspace_id/messages/:message_id` | authMiddleware + workspaceMiddleware | `chatController.deleteMessage` | Eliminar mensaje propio |

**Middleware reutilizado:**
- `auth.middleware.js` — verifica JWT
- `workspace.middleware.js` — verifica que el usuario sea miembro del workspace

---

## 3. Controladores

### `controllers/chat.controller.js` — clase `ChatController`

**`sendMessage(req, res)`:**
1. Extrae `contenido` del body (debe tener al menos 1 carácter).
2. Usa `req.workspace` y `req.user` del middleware.
3. Crea el mensaje en DB con `fk_workspace_id`, `fk_user_id`, `contenido`.
4. Emite el mensaje por Socket.io a la sala `workspace:{workspace_id}`.
5. Retorna 201 con el mensaje creado (incluyendo datos del usuario populados).

**`getMessages(req, res)`:**
1. Extrae query params: `page` (default: 1), `limit` (default: 50).
2. Busca mensajes del workspace con paginación descendente por fecha.
3. Populate `fk_user_id` para traer nombre y email del autor.
4. Retorna `{ data, page, totalPages, total }`.

**`deleteMessage(req, res)`:**
1. Valida que el mensaje exista y pertenezca al workspace.
2. Verifica que el `fk_user_id` del mensaje sea igual al `req.user.id`.
3. Elimina el mensaje (hard delete).
4. Emite evento `message:deleted` por Socket.io.
5. Retorna 200.

---

## 4. Repositorios

### `repositories/message.repository.js`

| Método | Descripción |
|--------|-------------|
| `create(workspace_id, user_id, contenido)` | Crear un mensaje |
| `getByWorkspaceId(workspace_id, page, limit)` | Paginación descendente por `fecha_creacion` con populate de `fk_user_id` |
| `getById(message_id)` | Buscar mensaje por ID |
| `deleteById(message_id)` | Hard delete |

**Formato de paginación:**
```js
const getByWorkspaceId = async (workspace_id, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Message.find({ fk_workspace_id: workspace_id })
      .sort({ fecha_creacion: -1 })
      .skip(skip)
      .limit(limit)
      .populate('fk_user_id', 'nombre email'),
    Message.countDocuments({ fk_workspace_id: workspace_id })
  ]);
  return { data, total, page, totalPages: Math.ceil(total / limit) };
};
```

---

## 5. Comunicación en Tiempo Real (Socket.io)

### Instalación

```bash
npm install socket.io
```

### Integración en `main.js`

```js
import { Server as SocketServer } from 'socket.io';
import http from 'http';

const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: { origin: ENVIRONMENT.URL_FRONTEND }
});

// Middleware de autenticación para Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Token requerido'));
  try {
    const decoded = jwt.verify(token, ENVIRONMENT.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Token inválido'));
  }
});

io.on('connection', (socket) => {
  // Unirse a sala del workspace
  socket.on('workspace:join', (workspace_id) => {
    socket.join(`workspace:${workspace_id}`);
  });

  // Salir de sala
  socket.on('workspace:leave', (workspace_id) => {
    socket.leave(`workspace:${workspace_id}`);
  });

  socket.on('disconnect', () => {});
});

// Poner io a disposición de los controladores
export { io };
```

### Eventos

| Evento | Dirección | Payload | Descripción |
|--------|-----------|---------|-------------|
| `workspace:join` | Cliente → Servidor | `workspace_id` | Unirse a la sala de un workspace |
| `workspace:leave` | Cliente → Servidor | `workspace_id` | Salir de la sala |
| `message:new` | Servidor → Cliente | `{ message }` | Nuevo mensaje en el workspace |
| `message:deleted` | Servidor → Cliente | `{ message_id, workspace_id }` | Mensaje eliminado |

En el controlador, después de crear el mensaje:

```js
const { io } = await import('../main.js');
io.to(`workspace:${workspace_id}`).emit('message:new', message);
```

---

## 6. Frontend - Pantallas y Servicios

### Nuevo archivo: `services/chatService.js`

```js
import httpClient from './httpClient';

const chatService = {
  getMessages: (workspaceId, page = 1) =>
    httpClient(`/workspace/${workspaceId}/messages?page=${page}`),

  sendMessage: (workspaceId, contenido) =>
    httpClient(`/workspace/${workspaceId}/messages`, {
      method: 'POST',
      body: { contenido }
    }),

  deleteMessage: (workspaceId, messageId) =>
    httpClient(`/workspace/${workspaceId}/messages/${messageId}`, {
      method: 'DELETE'
    })
};

export default chatService;
```

### Nuevo hook: `hooks/useChat.js`

Hook personalizado que maneja:
- Estado de mensajes (array)
- Conexión Socket.io
- Escucha de eventos `message:new` y `message:deleted`
- Paginación (scroll infinito hacia arriba)
- Envío de mensajes

```js
// Estructura del hook useChat
const useChat = (workspaceId, token) => {
  // Conexión Socket.io con autenticación
  // Unirse a sala workspace:{workspaceId}
  // Cargar mensajes iniciales (GET)
  // Escuchar message:new → agregar al estado
  // Escuchar message:deleted → filtrar del estado
  // Función sendMessage
  // Función loadMore (paginación)
  // Retornar { messages, sendMessage, loadMore, loading }
};
```

### Nueva pantalla: `Screens/ChatScreen/ChatScreen.jsx`

- Ruta: `/workspace/:workspaceId/chat`
- Protegida (requiere autenticación)
- Header con nombre del workspace
- Lista de mensajes con scroll infinito hacia arriba
  - Cada mensaje muestra: avatar/nombre, contenido, fecha
  - Botón de eliminar solo en mensajes propios
- Input fijo abajo para escribir y enviar
- Usa `useChat` hook y `chatService`

### Actualización en `App.jsx`

Agregar ruta:
```jsx
<Route path="/workspace/:workspaceId/chat" element={<ChatScreen />} />
```

---

## 7. Resumen de Archivos Nuevos

### Backend

| Archivo | Descripción |
|---------|-------------|
| `Backend/src/models/message.model.js` | Modelo de Message |
| `Backend/src/repositories/message.repository.js` | Repositorio de Message |
| `Backend/src/controllers/chat.controller.js` | Controlador de Chat |
| `Backend/src/routes/chat.router.js` | Rutas de Chat |
| Modificar `Backend/src/main.js` | Agregar Socket.io y montar rutas |

### Frontend

| Archivo | Descripción |
|---------|-------------|
| `Frontend/src/services/chatService.js` | Servicio HTTP de chat |
| `Frontend/src/hooks/useChat.js` | Hook con Socket.io y estado |
| `Frontend/src/Screens/ChatScreen/ChatScreen.jsx` | Pantalla de chat |
| Modificar `Frontend/src/App.jsx` | Agregar ruta `/workspace/:workspaceId/chat` |

---

**Total: 6 archivos nuevos, 2 archivos modificados.**

Todo el código existente de autenticación (JWT), membresías (workspace middleware), manejo de errores y cliente HTTP se reutiliza sin cambios.
