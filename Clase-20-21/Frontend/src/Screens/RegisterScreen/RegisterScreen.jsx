import React, { useState } from 'react'
import { Link } from 'react-router'
import useForm from '../../hooks/useForm'
import { register } from '../../services/authService'

export const RegisterScreen = () => {

    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const initial_form_state = {
        name: '',
        email: '',
        password: ''
    }

    async function onSubmit (formData){
        setError(null)
        setLoading(true)
        const response = await register(formData.name, formData.email, formData.password)
        if (response.ok) {
            setSuccess(true)
        } else {
            setError(response.message || "Error al registrarse")
        }
        setLoading(false)
    }

    const {formState, handleChange, handleSubmit} = useForm(initial_form_state, onSubmit)

    if (success) {
        return (
            <div className="contenedor-pantalla">
                <h1>Registro exitoso</h1>
                <p>Te enviamos un mail de verificación. Revisá tu bandeja de entrada.</p>
                <div className="links-utiles">
                    <Link to={'/login'}>Ir a iniciar sesión</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="contenedor-pantalla">
            <h1>Registrarse</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Nombre:</label>
                    <input id='name' name='name' type='text' value={formState.name} onChange={handleChange}/>
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input id='email' name='email' type='email' value={formState.email} onChange={handleChange}/>
                </div>
                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input id='password' name='password' type='password' value={formState.password} onChange={handleChange}/>
                </div>

                {error && <p className="error-mensaje">{error}</p>}

                <button disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrarse'}
                </button>
            </form>
            <div className="links-utiles">
                <Link to={'/login'}>Ya tenés cuenta? Iniciar sesión</Link>
            </div>
        </div>
    )
}