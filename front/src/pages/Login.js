import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const { data } = await api.post('/auth/login', { email, senha });
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login. Verifique as credenciais.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <h1>☕ Cafeteria</h1>
          <p>Sistema de Gestão Interno</p>
        </div>

        {erro && <div className="alerta alerta-erro">⚠️ {erro}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-grupo">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </div>
          <div className="form-grupo">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button className="btn btn-primario auth-btn-full" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <p className="auth-link-text">
          Não tem conta?{' '}
          <Link to="/cadastro" className="auth-link">Criar conta</Link>
        </p>

        <p className="auth-hint">
          Contas de teste: admin@cafeteria.com / admin123
        </p>
      </div>
    </div>
  );
}
