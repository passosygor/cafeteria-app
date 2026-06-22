import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import Categorias from './pages/Categorias';
import Estoque from './pages/Estoque';
import Usuarios from './pages/Usuarios';
import Pedidos from './pages/Pedidos';

function RotaProtegida({ children, roles }) {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RotaProtegida><Layout /></RotaProtegida>}>
          <Route index element={<Dashboard />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="categorias" element={<RotaProtegida roles={['ADMIN','FUNCIONARIO']}><Categorias /></RotaProtegida>} />
          <Route path="estoque" element={<RotaProtegida roles={['ADMIN','FUNCIONARIO']}><Estoque /></RotaProtegida>} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="usuarios" element={<RotaProtegida roles={['ADMIN']}><Usuarios /></RotaProtegida>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
