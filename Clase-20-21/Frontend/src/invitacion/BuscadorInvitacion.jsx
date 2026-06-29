import React, { useState } from 'react';
import httpClient from '../services/httpClient';

export const BuscadorInvitacion = ({ workspaceId }) => {
    const [email, setEmail] = useState('');
    const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);
    const [tipoMensaje, setTipoMensaje] = useState('');

    const mostrarMensaje = (texto, tipo) => {
        setMensaje(texto);
        setTipoMensaje(tipo);
    };

    const buscarUsuario = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) return;

        setCargando(true);
        setMensaje('');
        setTipoMensaje('');
        setUsuarioEncontrado(null);

        const data = await httpClient('/auth/email_invitacion', {
            method: 'POST',
            body: { email: email.trim() }
        });
        if (data.ok) {
            setUsuarioEncontrado(data.usuario);
        } else {
            mostrarMensaje(data.message || 'No se encontró el usuario.', 'error');
        }
        setCargando(false);
    };

    const enviarInvitacion = async () => {
        if (!usuarioEncontrado) return;

        const data = await httpClient('/workspaces/invitar', {
            method: 'POST',
            body: {
                workspace_id: workspaceId,
                usuario_id: usuarioEncontrado._id
            }
        });
        if (data.ok) {
            mostrarMensaje(`¡Invitación enviada con éxito a ${usuarioEncontrado.nombre}!`, 'exito');
            setUsuarioEncontrado(null);
            setEmail('');
        } else {
            mostrarMensaje(data.message || 'No se pudo enviar la invitación.', 'error');
        }
    };

    return (
        <div className="contenedor-pantalla" style={{ maxWidth: '500px' }}>
            <h3>Invitar miembro al Workspace</h3>
            
            <form onSubmit={buscarUsuario} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input 
                    type="email" 
                    placeholder="Escribí el email de la persona..." 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ marginBottom: 0, flex: 1 }}
                    required
                />
                <button 
                    type="submit" 
                    disabled={cargando}
                    style={{ width: 'auto', padding: '0.8rem 1.5rem' }}
                >
                    {cargando ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            {mensaje && (
                <div className={`alerta ${tipoMensaje}`} style={{
                    marginTop: '1rem',
                    padding: '0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    backgroundColor: tipoMensaje === 'exito' ? '#1f6feb' : '#da3637',
                    color: '#fff'
                }}>
                    {mensaje}
                </div>
            )}

            {usuarioEncontrado && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '1rem 1.2rem',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--borde)',
                    borderRadius: '8px',
                     marginTop: '10px'
                }}>
                    <div>
                        <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--texto-principal)' }}>{usuarioEncontrado.nombre}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--texto-secundario)' }}>{usuarioEncontrado.email}</p>
                    </div>
                    <button 
                        onClick={enviarInvitacion}
                        style={{ width: 'auto', padding: '0.5rem 1.2rem', backgroundColor: '#238636' }}
                    >
                        Invitar
                    </button>
                </div>
            )}
        </div>
    );
};