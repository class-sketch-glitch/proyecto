import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import httpClient from '../services/httpClient';

export const Pantalla_cambio_contraseña = () => {
  // Estado para guardar el email que escribe el usuario
  const [email, setEmail] = useState('');
  // Estados para mostrar feedback visual en la pantalla
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const handleEnviarEmail = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setCargando(true);
    setMensaje({ texto: '', tipo: '' });

    const datos = await httpClient('/auth/forgot-password', {
      method: 'POST',
      body: { email }
    });

    if (datos.ok) {
      setMensaje({
        texto: '¡Mail enviado con éxito! Revisá tu casilla de correo.',
        tipo: 'exito',
      });
      setEmail('');
    } else {
      setMensaje({
        texto: datos.message || 'Hubo un error al procesar la solicitud.',
        tipo: 'error',
      });
    }
    setCargando(false);
  };

  return (
    <div className="contenedor-pantalla">
      <h2>Recuperar Contraseña</h2>
      <p>Ingresá tu correo electrónico y te enviaremos un link para cambiar tu clave.</p>

      <form onSubmit={handleEnviarEmail}>
        <input
          type="email"
          placeholder="Correo electrónico"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Actualiza el estado con lo que escribe el usuario
          disabled={cargando}
        />

        <button type="submit" disabled={cargando}>
          {cargando ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>

      {/* Alertas visuales para el usuario */}
      {mensaje.texto && (
        <div className={`alerta ${mensaje.tipo}`} style={{
          marginTop: '1rem',
          padding: '0.8rem',
          borderRadius: '6px',
          fontSize: '0.9rem',
          backgroundColor: mensaje.tipo === 'exito' ? '#1f6feb' : '#da3637',
          color: '#fff'
        }}>
          {mensaje.texto}
        </div>
      )}

      <div className="links-utiles">
        <Link to="/login">Volver al Iniciar Sesión</Link>
      </div>
    </div>
  );
};
