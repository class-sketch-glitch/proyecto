import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { verifyEmail } from '../services/authService'

export const VerificacionScreen = () => {
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const token = searchParams.get('verification_token')
        if (!token) {
            setStatus('error')
            setMessage('Falta el token de verificación')
            return
        }

        verifyEmail(token)
            .then(res => {
                if (res.ok) {
                    setStatus('success')
                    setMessage(res.message || 'Email verificado correctamente')
                } else {
                    setStatus('error')
                    setMessage(res.message || 'Error al verificar el email')
                }
            })
    }, [searchParams])

    return (
        <div className="contenedor-pantalla">
            {status === 'loading' && (
                <>
                    <h1>Verificando tu cuenta...</h1>
                    <p>Por favor esperá un momento.</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <h1>¡Cuenta verificada!</h1>
                    <p>{message}</p>
                    <Link to="/login">Ir a iniciar sesión</Link>
                </>
            )}

            {status === 'error' && (
                <>
                    <h1>Error de verificación</h1>
                    <p>{message}</p>
                    <Link to="/login">Volver al inicio</Link>
                </>
            )}
        </div>
    )
}
