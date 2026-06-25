let io = null

export function setIO(ioInstance) {
  io = ioInstance
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io no inicializado')
  }
  return io
}
