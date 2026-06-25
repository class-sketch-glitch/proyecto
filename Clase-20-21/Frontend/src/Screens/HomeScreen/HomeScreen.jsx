import React, { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { jwtDecode } from 'jwt-decode'
import httpClient from '../../services/httpClient'

const HomeScreen = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('access_token')

  const [profile, setProfile] = useState(null)
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState(null)

  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  if (!token) {
    return <Navigate to="/login" />
  }

  let user
  try {
    user = jwtDecode(token)
  } catch {
    localStorage.removeItem('access_token')
    return <Navigate to="/login" />
  }

  async function fetchProfile() {
    const data = await httpClient('/profile', { token })
    if (data.ok) {
      setProfile(data.data)
      setWorkspaces(data.data.workspace_lista || [])
    } else {
      setError(data.message || 'Error al cargar perfil')
    }
    setLoading(false)
  }

  useEffect(() => { fetchProfile() }, [token])

  async function handleCreateWorkspace(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setCreateError(null)
    const data = await httpClient('/workspace', {
      method: 'POST',
      body: { nombre: newName.trim(), descripcion: newDesc.trim() },
      token
    })
    if (data.ok) {
      setNewName('')
      setNewDesc('')
      setShowForm(false)
      await fetchProfile()
    } else {
      setCreateError(data.message || 'Error al crear workspace')
    }
    setCreating(false)
  }

  function startEdit(ws) {
    setEditingId(ws._id)
    setEditName(ws.nombre)
    setEditDesc(ws.descripcion || '')
    setEditError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditDesc('')
    setEditError(null)
  }

  async function handleSaveEdit(workspace_id) {
    if (!editName.trim()) {
      setEditError('El nombre no puede estar vacío')
      return
    }
    setSaving(true)
    setEditError(null)
    const data = await httpClient(`/workspace/${workspace_id}`, {
      method: 'PUT',
      body: { nombre: editName.trim(), descripcion: editDesc.trim() },
      token
    })
    if (data.ok) {
      cancelEdit()
      await fetchProfile()
    } else {
      setEditError(data.message || 'Error al actualizar')
    }
    setSaving(false)
  }

  async function handleDelete(workspace_id) {
    const confirmar = window.confirm('¿Estás seguro de que querés eliminar este espacio de trabajo?')
    if (!confirmar) return

    setDeletingId(workspace_id)
    setDeleteError(null)
    const data = await httpClient(`/workspace/${workspace_id}`, {
      method: 'DELETE',
      token
    })
    if (data.ok) {
      await fetchProfile()
    } else {
      setDeleteError(data.message || 'Error al eliminar')
    }
    setDeletingId(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  const handleDeleteAccount = async () => {
    const confirmar = window.confirm('¿Estás seguro de que querés eliminar tu cuenta? Esta acción no se puede deshacer.')
    if (!confirmar) return

    const data = await httpClient('/profile', {
      method: 'DELETE',
      token
    })

    if (data.ok) {
      localStorage.removeItem('access_token')
      navigate('/login')
    } else {
      alert(data.message || 'Error al eliminar la cuenta')
    }
  }

  if (loading) {
    return (
      <div className="pantalla-home">
        <div className="perfil-tarjeta" style={{ textAlign: 'center' }}>
          <p>Cargando tu perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pantalla-home">
      <div className="perfil-tarjeta">
        <h1>Mi Cuenta</h1>

        {error && <div className="error-mensaje">{error}</div>}

        <div className="perfil-info">
          <p>
            <span className="etiqueta">Nombre</span>
            <span className="valor">{profile?.nombre || user.nombre}</span>
          </p>
          <p>
            <span className="etiqueta">Email</span>
            <span className="valor">{profile?.email || user.email}</span>
          </p>
          <p>
            <span className="etiqueta">ID</span>
            <span className="valor">{profile?.id || user.id}</span>
          </p>
          <p>
            <span className="etiqueta">Miembro desde</span>
            <span className="valor">{new Date(profile?.fecha_creacion || user.fecha_creacion).toLocaleDateString()}</span>
          </p>
        </div>

        <button className="btn-cerrar-sesion" onClick={handleLogout}>
          Cerrar sesión
        </button>

        <button className="btn-eliminar-cuenta" onClick={handleDeleteAccount}>
          Eliminar sesión
        </button>
      </div>

      <div className="workspace-seccion">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h2 style={{ margin: 0 }}>Mis Espacios de Trabajo</h2>
          <button
            onClick={() => { setShowForm(!showForm); setCreateError(null) }}
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            {showForm ? 'Cancelar' : '+ Nuevo'}
          </button>
        </div>

        {deleteError && <div className="error-mensaje">{deleteError}</div>}

        {showForm && (
          <form onSubmit={handleCreateWorkspace}
            style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--borde)',
              borderRadius: '8px',
              padding: '1.2rem',
              marginBottom: '1.2rem'
            }}
          >
            <input
              name="nombre"
              placeholder="Nombre del espacio de trabajo"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ marginBottom: '0.8rem' }}
              required
            />
            <input
              name="descripcion"
              placeholder="Descripción (opcional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              style={{ marginBottom: '0.8rem' }}
            />
            {createError && <p className="error-mensaje">{createError}</p>}
            <button disabled={creating} style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>
              {creating ? 'Creando...' : 'Crear'}
            </button>
          </form>
        )}

        {workspaces.length === 0 ? (
          <div className="workspace-vacio">
            <p>Todavía no pertenecés a ningún espacio de trabajo.</p>
          </div>
        ) : (
          <div className="workspace-lista">
            {workspaces.map((ws) => (
              <div key={ws._id} className="workspace-item">
                {editingId === ws._id ? (
                  <div className="workspace-item-edit">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nombre"
                      style={{ marginBottom: '0.5rem' }}
                    />
                    <input
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Descripción"
                      style={{ marginBottom: '0.5rem' }}
                    />
                    {editError && <p className="error-mensaje" style={{ margin: '0 0 0.5rem' }}>{editError}</p>}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleSaveEdit(ws._id)} disabled={saving} style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                        {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button onClick={cancelEdit} className="btn-cancelar" style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="workspace-item-info">
                      <h3>{ws.nombre}</h3>
                      {ws.descripcion && <p>{ws.descripcion}</p>}
                    </div>
                    <div className="workspace-item-acciones">
                      <span className={`workspace-item-estado ${ws.estado ? 'activo' : 'inactivo'}`}>
                        {ws.estado ? 'Activo' : 'Inactivo'}
                      </span>
                      <button
                        onClick={() => startEdit(ws)}
                        className="btn-editar"
                        title="Editar"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDelete(ws._id)}
                        className="btn-eliminar"
                        title="Eliminar"
                        disabled={deletingId === ws._id}
                      >
                        {deletingId === ws._id ? '...' : '✕'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomeScreen
