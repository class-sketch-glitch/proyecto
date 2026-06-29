import React from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { LoginScreen } from './Screens/LoginScreen/LoginScreen'
import { RegisterScreen } from './Screens/RegisterScreen/RegisterScreen'
import { Pantalla_cambio_contraseña } from './cambio_contraseña/Pantalla_cambio_contraseña'
import { Re_contraseña } from './cambio_contraseña/Re_contraseña'

import HomeScreen from './Screens/HomeScreen/HomeScreen.jsx'
import './app.css';
import { BuscadorInvitacion } from './invitacion/BuscadorInvitacion.jsx'
import { VerificacionScreen } from './verificacion/VerificacionScreen.jsx'
const App = () => {
  return (
    <Routes>
      <Route 
          path='/login'
          element={<LoginScreen/>}
      />
      <Route
        path='/register'
        element={<RegisterScreen/>}
      />
      
          <Route
         path='/home'
        element={<HomeScreen/>}
      />
      <Route
        path='/olvido_su_contraseña'
        element={< Pantalla_cambio_contraseña/>}
      />
      <Route
        path='/re_contrase_a'
        element={<Re_contraseña/>}
      />
         <Route
        path='/invitar'
        element={< BuscadorInvitacion/>}
      />
      <Route
        path='/verificacion'
        element={<VerificacionScreen/>}
      />
      <Route 
        path='/'
        element={<LoginScreen/>}
      />
      <Route 
        path='/*'
        element={<Navigate to={'/home'} />}
      />
    </Routes>
  )
}

export default App