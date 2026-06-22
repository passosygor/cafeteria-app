import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const VAZIO = { nome: '', email: '', senha: '', cpf: '', telefone: '', role: 'CLIENTE' };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [usuAtual, setUsuAtual] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [busca, setBusca] = useState('');

  const carregar = useCallback(async () => {
    const { data } = await api.get('/usuarios');
    setUsuarios(data);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function mostrarMensagem(tipo, texto) {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000);
  }

  function abrirCriar() { setUsuAtual(null); setForm(VAZIO); setModalAberto(true); }
  function abrirEditar(u) { setUsuAtual(u); setForm({ nome: u.nome, email: u.email, senha: '', cpf: u.cpf, telefone: u.telefone, role: u.role }); setModalAberto(true); }

  async function salvar(e) {
    e.preventDefault();
    try {
      if (usuAtual) await api.put(`/usuarios/${usuAtual.id}`, { nome: form.nome, telefone: form.telefone, role: form.role });
      else await api.post('/usuarios', form);
      mostrarMensagem('sucesso', usuAtual ? 'Usuário atualizado!' : 'Usuário criado!');
      setModalAberto(false);
      carregar();
    } catch (err) {
      mostrarMensagem('erro', err.response?.data?.erro || 'Erro ao salvar.');
    }
  }

  async function desativar(id) {
    if (!window.confirm('Desativar este usuário?')) return;
    try { await api.delete(`/usuarios/${id}`); mostrarMensagem('sucesso', 'Usuário desativado.'); carregar(); }
    catch { mostrarMensagem('erro', 'Erro ao desativar.'); }
  }

  const roleLabel = { ADMIN: 'Admin', FUNCIONARIO: 'Funcionário', CLIENTE: 'Cliente' };
  const roleCor = { ADMIN: 'vermelho', FUNCIONARIO: 'cafe', CLIENTE: 'verde' };

  const filtrados = usuarios.filter(u =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <div className="pagina-topo">
        <div>
          <div className="pagina-titulo">👥 Usuários</div>
          <div className="pagina-subtitulo">{filtrados.length} usuário(s)</div>
        </div>
        <button className="btn btn-primario" onClick={abrirCriar}>+ Novo Usuário</button>
      </div>

      {mensagem.texto && (
        <div className={`alerta alerta-${mensagem.tipo === 'erro' ? 'erro' : 'sucesso'}`}>
          {mensagem.tipo === 'erro' ? '⚠️' : '✅'} {mensagem.texto}
        </div>
      )}

      <div className="card" style={{ padding: '12px 24px' }}>
        <div className="barra-busca">
          <input placeholder="🔍 Buscar por nome ou e-mail..." value={busca} onChange={e => setBusca(e.target.value)} style={{ flex: 1 }} />
        </div>
      </div>

      <div className="card">
        <table className="tabela">
          <thead><tr><th>#</th><th>Nome</th><th>E-mail</th><th>CPF</th><th>Telefone</th><th>Perfil</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>
            {filtrados.map(u => (
              <tr key={u.id}>
                <td style={{ color: '#aaa' }}>#{u.id}</td>
                <td style={{ fontWeight: 600 }}>{u.nome}</td>
                <td>{u.email}</td>
                <td style={{ fontFamily: 'monospace' }}>{u.cpf}</td>
                <td>{u.telefone}</td>
                <td><span className={`badge badge-${roleCor[u.role]}`}>{roleLabel[u.role]}</span></td>
                <td><span className={`badge badge-${u.ativo ? 'verde' : 'cinza'}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secundario" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => abrirEditar(u)}>✏️</button>
                    {u.ativo && <button className="btn btn-perigo" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => desativar(u.id)}>🗑️</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalAberto(false)}>
          <div className="modal">
            <div className="modal-cabecalho">
              <h3>{usuAtual ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button className="modal-fechar" onClick={() => setModalAberto(false)}>×</button>
            </div>
            <form onSubmit={salvar}>
              <div className="form-grupo">
                <label>Nome *</label>
                <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
              </div>
              {!usuAtual && (
                <>
                  <div className="form-grupo">
                    <label>E-mail *</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div className="form-grupo">
                    <label>Senha *</label>
                    <input type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} required />
                  </div>
                  <div className="form-grid-2">
                    <div className="form-grupo">
                      <label>CPF *</label>
                      <input value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" required />
                    </div>
                    <div className="form-grupo">
                      <label>Telefone *</label>
                      <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(00) 00000-0000" required />
                    </div>
                  </div>
                </>
              )}
              {usuAtual && (
                <div className="form-grupo">
                  <label>Telefone</label>
                  <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
                </div>
              )}
              <div className="form-grupo">
                <label>Perfil</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="CLIENTE">Cliente</option>
                  <option value="FUNCIONARIO">Funcionário</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="modal-acoes">
                <button type="button" className="btn btn-secundario" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primario">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
