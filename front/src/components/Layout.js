import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const icones = {
  dashboard: '☕',
  produtos: '🧁',
  categorias: '🏷️',
  estoque: '📦',
  pedidos: '🧾',
  usuarios: '👥',
};

export default function Layout() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const isAdmin = usuario.role === 'ADMIN';
  const isInterno = ['ADMIN', 'FUNCIONARIO'].includes(usuario.role);

  function sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  }

  const roleLabel = { ADMIN: 'Administrador', FUNCIONARIO: 'Funcionário', CLIENTE: 'Cliente' };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>☕ Cafeteria</h2>
          <p>Sistema de Gestão</p>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section">Geral</span>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'ativo' : ''}`}>
            {icones.dashboard} Dashboard
          </NavLink>
          <NavLink to="/pedidos" className={({ isActive }) => `nav-link ${isActive ? 'ativo' : ''}`}>
            {icones.pedidos} Pedidos
          </NavLink>
          <NavLink to="/produtos" className={({ isActive }) => `nav-link ${isActive ? 'ativo' : ''}`}>
            {icones.produtos} Produtos
          </NavLink>

          {isInterno && (
            <>
              <span className="nav-section">Inventário</span>
              <NavLink to="/estoque" className={({ isActive }) => `nav-link ${isActive ? 'ativo' : ''}`}>
                {icones.estoque} Movimentação
              </NavLink>
              <NavLink to="/categorias" className={({ isActive }) => `nav-link ${isActive ? 'ativo' : ''}`}>
                {icones.categorias} Categorias
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <span className="nav-section">Administração</span>
              <NavLink to="/usuarios" className={({ isActive }) => `nav-link ${isActive ? 'ativo' : ''}`}>
                {icones.usuarios} Usuários
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="usuario-nome">{usuario.nome}</div>
          <div className="usuario-role">{roleLabel[usuario.role] || usuario.role}</div>
          <button className="btn-sair" onClick={sair}>Sair</button>
        </div>
      </aside>

      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}
