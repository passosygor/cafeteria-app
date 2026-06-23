import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Cadastro() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', cpf: '', telefone: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  function atualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleCadastro(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await api.post('/auth/cadastrar', form);

      const { data } = await api.post('/auth/login', { email: form.email, senha: form.senha });
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card login-card-wide">
        <div className="login-logo">
          <h1>☕ Cafeteria</h1>
          <p>Crie sua conta de cliente</p>
        </div>

        {erro && <div className="alerta alerta-erro">⚠️ {erro}</div>}

        <form onSubmit={handleCadastro}>
          <div className="form-grupo">
            <label>Nome completo</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => atualizar('nome', e.target.value)}
              placeholder="Seu nome"
              required
              autoFocus
            />
          </div>

          <div className="form-grupo">
            <label>E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => atualizar('email', e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-grupo">
              <label>CPF</label>
              <input
                type="text"
                value={form.cpf}
                onChange={(e) => atualizar('cpf', e.target.value)}
                placeholder="000.000.000-00"
                required
              />
            </div>
            <div className="form-grupo">
              <label>Telefone</label>
              <input
                type="text"
                value={form.telefone}
                onChange={(e) => atualizar('telefone', e.target.value)}
                placeholder="(48) 99999-9999"
                required
              />
            </div>
          </div>

          <div className="form-grupo">
            <label>Senha</label>
            <input
              type="password"
              value={form.senha}
              onChange={(e) => atualizar('senha', e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          <button
            className="btn btn-primario auth-btn-full"
            disabled={carregando}
          >
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <p className="auth-link-text">
          Já tem uma conta?{' '}
          <Link to="/login" className="auth-link">Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
