const asyncHandler = (fn) => async (...args) => {
  try {
    const result = await fn(...args)
    return result
  } catch (error) {
    console.error('[Error Handler]', error)
    return { ok: false, message: error.message || 'Error de conexión con el servidor' }
  }
}

export default asyncHandler