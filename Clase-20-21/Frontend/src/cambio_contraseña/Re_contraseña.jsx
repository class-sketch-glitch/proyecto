import React, { useState } from 'react';
import httpClient from '../services/httpClient';

export const Re_contraseña = () => {
    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState(false);

    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (nuevaContrasena.length < 6) {
            setError(true);
            setMensaje('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        const data = await httpClient('/auth/reset-password', {
            method: 'POST',
            body: {
                token: token,
                nueva_contrasena: nuevaContrasena
            }
        });

        if (data.ok) {
            setError(false);
            setMensaje('¡Contraseña cambiada con éxito! Ya podés iniciar sesión.');
            setNuevaContrasena('');
        } else {
            setError(true);
            setMensaje(data.message || 'Hubo un error al procesar la solicitud.');
        }
    };

    return (
        <div className="contenedor-pantalla">
            <h2>Restablecer Contraseña</h2>
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="password">Nueva Contraseña:</label>
                    <input 
                        type="password" 
                        id="password"
                        value={nuevaContrasena}
                        onChange={(e) => setNuevaContrasena(e.target.value)}
                        placeholder="Escribí tu nueva clave"
                        required
                    />
                </div>

                <button type="submit">
                    Actualizar Contraseña
                </button>
            </form>

            {mensaje && (
                <div className={`alerta`} style={{
                    marginTop: '1rem',
                    padding: '0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    backgroundColor: error ? '#da3637' : '#1f6feb',
                    color: '#fff'
                }}>
                    {mensaje}
                </div>
            )}
        </div>
    );
};