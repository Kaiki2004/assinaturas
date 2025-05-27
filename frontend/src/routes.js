import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ListaPessoas from './components/ListaPessoas';
import UploadPage from './components/UploadPage';
import FluxoAssinatura from './components/FluxoAssinatura';
import Home from './components/Home';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';  
import ListaAssinaturas from './components/ListaAssinaturas';

const AppRoutes = () => (
  <Routes>
    <Route index path='/' element={<Home />} />  
    <Route path="login" element={<Login />} />
    <Route path="assinar" element={<FluxoAssinatura />} />

    {/* ROTAS PROTEGIDAS */}
    <Route
      path="pessoas"
      element={
        <PrivateRoute>
          <ListaPessoas />
        </PrivateRoute>
      }
    />

    <Route
      path="uploadpage"
      element={
        <PrivateRoute>
          <UploadPage />
        </PrivateRoute>
      }
    />

    <Route
      path="assinaturas"
      element={
        <PrivateRoute>
          <ListaAssinaturas />
        </PrivateRoute>
      }
    />
  </Routes>
  
);

export default AppRoutes;
