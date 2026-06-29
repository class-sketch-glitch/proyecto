import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import useForm from '../../hooks/useForm'
import { login } from '../../services/authService'

export const LoginScreen = () => {

    const navigate = useNavigate()
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const initial_form_state = {
        email: '',
        password: ''
    }

    async function onSubmit (formData){
        setError(null)
        setLoading(true)
        const response = await login(formData.email, formData.password)
        if (response.ok) {
            localStorage.setItem('access_token', response.data.access_token)
            navigate('/home')
        } else {
            setError(response.message || "Error al iniciar sesión")
        }
        setLoading(false)
    }

    const {formState, handleChange, handleSubmit} = useForm(initial_form_state, onSubmit)


    return (
        <div className="contenedor-pantalla">
            <h1>Iniciar sesion</h1>

            <form onSubmit={handleSubmit}>
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
                    {loading ? 'Ingresando...' : 'Iniciar sesion'}
                </button>
            </form>
            <div className="links-utiles">
                <Link to={'/register'}>Si no tienes cuenta — Registrate</Link>
                <Link to={'/olvido_su_contraseña'}>Olvidé mi contraseña</Link>
            </div>
        </div>
    )
}