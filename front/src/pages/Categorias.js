import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [catAtual, setCatAtual] = useState(null);
  const [form, setForm] = useState({ nome: '', descricao: '' });
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const carregar = useCallback(async () => {
    const { data } = await api.get('/categorias');
    setCategorias(data);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function mostrarMensagem(tipo, texto) {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000);
  }

  function abrirCriar() { setCatAtual(null); setForm({ nome: '', descricao: '' }); setModalAberto(true); }
  function abrirEditar(c) { setCatAtual(c); setForm({ nome: c.nome, descricao: c.descricao || '' }); setModalAberto(true); }

  async function salvar(e) {
    e.preventDefault();
    try {
      if (catAtual) await api.put(`/categorias/${catAtual.id}`, form);
      else await api.post('/categorias', form);
      mostrarMensagem('sucesso', catAtual ? 'Categoria atualizada!' : 'Categoria criada!');
      setModalAberto(false);
      carregar();
    } catch (err) {
      mostrarMensagem('erro', err.response?.data?.erro || 'Erro ao salvar.');
    }
  }

  async function deletar(id) {
    if (!window.confirm('Deseja desativar esta categoria?')) return;
    try {
      await api.delete(`/categorias/${id}`);
      mostrarMensagem('sucesso', 'Categoria desativada.');
      carregar();
    } catch { mostrarMensagem('erro', 'Erro ao desativar.'); }
  }

  return (
    <div>
      <div className="pagina-topo">
        <div>
          <div className="pagina-titulo">🏷️ Categorias</div>
          <div className="pagina-subtitulo">{categorias.length} categoria(s)</div>
        </div>
        <button className="btn btn-primario" onClick={abrirCriar}>+ Nova Categoria</button>
      </div>

      {mensagem.texto && (
        <div className={`alerta alerta-${mensagem.tipo === 'erro' ? 'erro' : 'sucesso'}`}>
          {mensagem.tipo === 'erro' ? '⚠️' : '✅'} {mensagem.texto}
        </div>
      )}

      <div className="card">
        <table className="tabela">
          <thead><tr><th>#</th><th>Nome</th><th>Descrição</th><th>Produtos</th><th>Ações</th></tr></thead>
          <tbody>
            {categorias.map(c => (
              <tr key={c.id}>
                <td style={{ color: '#aaa' }}>#{c.id}</td>
                <td style={{ fontWeight: 600 }}>{c.nome}</td>
                <td style={{ color: '#777' }}>{c.descricao || '—'}</td>
                <td><span className="badge badge-cafe">{c._count?.produtos || 0} produtos</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secundario" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => abrirEditar(c)}>✏️</button>
                    <button className="btn btn-perigo" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => deletar(c.id)}>🗑️</button>
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
              <h3>{catAtual ? 'Editar Categoria' : 'Nova Categoria'}</h3>
              <button className="modal-fechar" onClick={() => setModalAberto(false)}>×</button>
            </div>
            <form onSubmit={salvar}>
              <div className="form-grupo">
                <label>Nome *</label>
                <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Bebidas Quentes" required />
              </div>
              <div className="form-grupo">
                <label>Descrição</label>
                <input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição opcional" />
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
