import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const VAZIO = { nome: '', descricao: '', preco: '', estoque: '', estoqueMin: '5', categoriaId: '' };

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalEstoque, setModalEstoque] = useState(false);
  const [produtoAtual, setProdutoAtual] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [movForm, setMovForm] = useState({ tipo: 'ENTRADA', quantidade: '', observacao: '' });
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [carregando, setCarregando] = useState(true);

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const isInterno = ['ADMIN', 'FUNCIONARIO'].includes(usuario.role);

  const carregarDados = useCallback(async () => {
    try {
      const [pRes, cRes] = await Promise.all([api.get('/produtos'), api.get('/categorias')]);
      setProdutos(pRes.data);
      setCategorias(cRes.data);
    } catch { mostrarMensagem('erro', 'Erro ao carregar dados.'); }
    finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  function mostrarMensagem(tipo, texto) {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3500);
  }

  function abrirCriar() {
    setProdutoAtual(null);
    setForm(VAZIO);
    setModalAberto(true);
  }

  function abrirEditar(p) {
    setProdutoAtual(p);
    setForm({ nome: p.nome, descricao: p.descricao || '', preco: p.preco, estoque: p.estoque, estoqueMin: p.estoqueMin, categoriaId: p.categoriaId });
    setModalAberto(true);
  }

  function abrirEstoque(p) {
    setProdutoAtual(p);
    setMovForm({ tipo: 'ENTRADA', quantidade: '', observacao: '' });
    setModalEstoque(true);
  }

  async function salvar(e) {
    e.preventDefault();
    try {
      if (produtoAtual) {
        await api.put(`/produtos/${produtoAtual.id}`, form);
        mostrarMensagem('sucesso', 'Produto atualizado com sucesso!');
      } else {
        await api.post('/produtos', form);
        mostrarMensagem('sucesso', 'Produto criado com sucesso!');
      }
      setModalAberto(false);
      carregarDados();
    } catch (err) {
      mostrarMensagem('erro', err.response?.data?.erro || 'Erro ao salvar produto.');
    }
  }

  async function desativar(id) {
    if (!window.confirm('Deseja desativar este produto?')) return;
    try {
      await api.delete(`/produtos/${id}`);
      mostrarMensagem('sucesso', 'Produto desativado.');
      carregarDados();
    } catch { mostrarMensagem('erro', 'Erro ao desativar produto.'); }
  }

  async function salvarMovimento(e) {
    e.preventDefault();
    try {
      await api.post('/estoque', { produtoId: produtoAtual.id, ...movForm, quantidade: Number(movForm.quantidade) });
      mostrarMensagem('sucesso', `${movForm.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'} registrada com sucesso!`);
      setModalEstoque(false);
      carregarDados();
    } catch (err) {
      mostrarMensagem('erro', err.response?.data?.erro || 'Erro ao registrar movimento.');
    }
  }

  const produtosFiltrados = produtos.filter(p => {
    const buscaOk = p.nome.toLowerCase().includes(busca.toLowerCase());
    const catOk = filtroCategoria ? p.categoriaId === Number(filtroCategoria) : true;
    return buscaOk && catOk;
  });

  function nivelEstoque(p) {
    if (p.estoque <= 0) return { cor: '#C62828', pct: 0, label: 'Esgotado' };
    const pct = Math.min((p.estoque / (p.estoqueMin * 3)) * 100, 100);
    if (p.estoque <= p.estoqueMin) return { cor: '#F9A825', pct, label: 'Baixo' };
    return { cor: '#2E7D32', pct, label: 'OK' };
  }

  if (carregando) return <div style={{ padding: 40, color: '#999' }}>Carregando produtos...</div>;

  return (
    <div>
      <div className="pagina-topo">
        <div>
          <div className="pagina-titulo">🧁 Produtos</div>
          <div className="pagina-subtitulo">{produtosFiltrados.length} produto(s) encontrado(s)</div>
        </div>
        {isInterno && (
          <button className="btn btn-primario" onClick={abrirCriar}>+ Novo Produto</button>
        )}
      </div>

      {mensagem.texto && (
        <div className={`alerta alerta-${mensagem.tipo === 'erro' ? 'erro' : 'sucesso'}`}>
          {mensagem.tipo === 'erro' ? '⚠️' : '✅'} {mensagem.texto}
        </div>
      )}

      <div className="card" style={{ padding: '16px 24px' }}>
        <div className="barra-busca">
          <input
            type="text"
            placeholder="🔍 Buscar produto..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="tabela-wrapper">
          <table className="tabela">
            <thead>
              <tr>
                <th>#</th>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Estoque</th>
                {isInterno && <th>Situação</th>}
                {isInterno && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#999', padding: 32 }}>Nenhum produto encontrado.</td></tr>
              ) : produtosFiltrados.map(p => {
                const nivel = nivelEstoque(p);
                return (
                  <tr key={p.id}>
                    <td style={{ color: '#aaa', fontSize: '0.8rem' }}>#{p.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.nome}</div>
                      {p.descricao && <div style={{ fontSize: '0.75rem', color: '#999', marginTop: 2 }}>{p.descricao}</div>}
                    </td>
                    <td><span className="badge badge-cafe">{p.categoria?.nome}</span></td>
                    <td style={{ fontWeight: 600 }}>R$ {Number(p.preco).toFixed(2)}</td>
                    <td>
                      <div className="estoque-bar">
                        <span style={{ minWidth: 28, fontWeight: 600 }}>{p.estoque}</span>
                        <div className="estoque-progresso">
                          <div className="estoque-fill" style={{ width: `${nivel.pct}%`, background: nivel.cor }} />
                        </div>
                      </div>
                    </td>
                    {isInterno && (
                      <td>
                        <span className={`badge badge-${p.ativo ? (nivel.label === 'OK' ? 'verde' : nivel.label === 'Baixo' ? 'amarelo' : 'vermelho') : 'cinza'}`}>
                          {p.ativo ? nivel.label : 'Inativo'}
                        </span>
                      </td>
                    )}
                    {isInterno && (
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secundario" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => abrirEditar(p)}>✏️</button>
                          <button className="btn btn-sucesso" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => abrirEstoque(p)}>📦</button>
                          {p.ativo && <button className="btn btn-perigo" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => desativar(p.id)}>🗑️</button>}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Produto */}
      {modalAberto && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalAberto(false)}>
          <div className="modal">
            <div className="modal-cabecalho">
              <h3>{produtoAtual ? '✏️ Editar Produto' : '+ Novo Produto'}</h3>
              <button className="modal-fechar" onClick={() => setModalAberto(false)}>×</button>
            </div>
            <form onSubmit={salvar}>
              <div className="form-grupo">
                <label>Nome *</label>
                <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Cappuccino" required />
              </div>
              <div className="form-grupo">
                <label>Descrição</label>
                <input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição opcional" />
              </div>
              <div className="form-grid-2">
                <div className="form-grupo">
                  <label>Preço (R$) *</label>
                  <input type="number" min="0" step="0.01" value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} placeholder="0.00" required />
                </div>
                <div className="form-grupo">
                  <label>Categoria *</label>
                  <select value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: e.target.value })} required>
                    <option value="">Selecione...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-grid-2">
                {!produtoAtual && (
                  <div className="form-grupo">
                    <label>Estoque Inicial</label>
                    <input type="number" min="0" value={form.estoque} onChange={e => setForm({ ...form, estoque: e.target.value })} placeholder="0" />
                  </div>
                )}
                <div className="form-grupo">
                  <label>Estoque Mínimo</label>
                  <input type="number" min="0" value={form.estoqueMin} onChange={e => setForm({ ...form, estoqueMin: e.target.value })} placeholder="5" />
                </div>
              </div>
              <div className="modal-acoes">
                <button type="button" className="btn btn-secundario" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primario">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Movimentação de Estoque */}
      {modalEstoque && produtoAtual && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalEstoque(false)}>
          <div className="modal">
            <div className="modal-cabecalho">
              <h3>📦 Movimentar Estoque</h3>
              <button className="modal-fechar" onClick={() => setModalEstoque(false)}>×</button>
            </div>
            <div className="alerta alerta-aviso" style={{ marginBottom: 16 }}>
              <strong>{produtoAtual.nome}</strong> — Estoque atual: <strong>{produtoAtual.estoque}</strong>
            </div>
            <form onSubmit={salvarMovimento}>
              <div className="form-grupo">
                <label>Tipo de Movimento *</label>
                <select value={movForm.tipo} onChange={e => setMovForm({ ...movForm, tipo: e.target.value })}>
                  <option value="ENTRADA">📥 Entrada (repor estoque)</option>
                  <option value="SAIDA">📤 Saída (retirada manual)</option>
                </select>
              </div>
              <div className="form-grupo">
                <label>Quantidade *</label>
                <input type="number" min="1" value={movForm.quantidade} onChange={e => setMovForm({ ...movForm, quantidade: e.target.value })} placeholder="Ex: 10" required />
              </div>
              <div className="form-grupo">
                <label>Observação</label>
                <input value={movForm.observacao} onChange={e => setMovForm({ ...movForm, observacao: e.target.value })} placeholder="Ex: Compra com fornecedor X" />
              </div>
              <div className="modal-acoes">
                <button type="button" className="btn btn-secundario" onClick={() => setModalEstoque(false)}>Cancelar</button>
                <button type="submit" className={`btn ${movForm.tipo === 'ENTRADA' ? 'btn-sucesso' : 'btn-perigo'}`}>
                  {movForm.tipo === 'ENTRADA' ? '📥 Registrar Entrada' : '📤 Registrar Saída'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
