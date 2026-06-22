import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const STATUS_COR = { PENDENTE: 'amarelo', EM_PREPARO: 'cafe', PRONTO: 'verde', RETIRADO: 'cinza', CANCELADO: 'vermelho' };
const STATUS_LABEL = { PENDENTE: 'Pendente', EM_PREPARO: 'Em Preparo', PRONTO: 'Pronto ✅', RETIRADO: 'Retirado', CANCELADO: 'Cancelado' };

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [detalhesAberto, setDetalhesAberto] = useState(false);
  const [pedidoAtual, setPedidoAtual] = useState(null);
  const [itens, setItens] = useState([{ produtoId: '', quantidade: 1 }]);
  const [usuarioId, setUsuarioId] = useState('');
  const [observacao, setObservacao] = useState('');
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [filtroStatus, setFiltroStatus] = useState('');

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const isInterno = ['ADMIN', 'FUNCIONARIO'].includes(usuario.role);

  const carregar = useCallback(async () => {
    try {
      const [pRes, prodRes] = await Promise.all([api.get('/pedidos'), api.get('/produtos')]);
      setPedidos(pRes.data);
      setProdutos(prodRes.data.filter(p => p.ativo));
      if (isInterno) {
        const uRes = await api.get('/usuarios');
        setUsuarios(uRes.data.filter(u => u.ativo));
      }
    } catch (err) { console.error(err); }
  }, [isInterno]);

  useEffect(() => { carregar(); }, [carregar]);

  function mostrarMensagem(tipo, texto) {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3500);
  }

  function addItem() { setItens([...itens, { produtoId: '', quantidade: 1 }]); }
  function removeItem(i) { setItens(itens.filter((_, idx) => idx !== i)); }
  function updateItem(i, campo, valor) {
    const novo = [...itens];
    novo[i] = { ...novo[i], [campo]: valor };
    setItens(novo);
  }

  function calcularTotal() {
    return itens.reduce((acc, item) => {
      const prod = produtos.find(p => p.id === Number(item.produtoId));
      return acc + (prod ? Number(prod.preco) * Number(item.quantidade) : 0);
    }, 0);
  }

  async function criarPedido(e) {
    e.preventDefault();
    const uid = isInterno ? usuarioId : usuario.id;
    if (!uid) return mostrarMensagem('erro', 'Selecione o cliente.');
    if (itens.some(i => !i.produtoId || i.quantidade < 1)) return mostrarMensagem('erro', 'Preencha todos os itens corretamente.');
    try {
      await api.post('/pedidos', { usuarioId: Number(uid), itens, observacao });
      mostrarMensagem('sucesso', 'Pedido criado com sucesso!');
      setModalAberto(false);
      carregar();
    } catch (err) {
      mostrarMensagem('erro', err.response?.data?.erro || 'Erro ao criar pedido.');
    }
  }

  async function mudarStatus(id, status) {
    try {
      await api.patch(`/pedidos/${id}/status`, { status });
      carregar();
    } catch { mostrarMensagem('erro', 'Erro ao atualizar status.'); }
  }

  const pedidosFiltrados = filtroStatus ? pedidos.filter(p => p.status === filtroStatus) : pedidos;

  return (
    <div>
      <div className="pagina-topo">
        <div>
          <div className="pagina-titulo">🧾 Pedidos</div>
          <div className="pagina-subtitulo">{pedidosFiltrados.length} pedido(s)</div>
        </div>
        <button className="btn btn-primario" onClick={() => { setItens([{ produtoId: '', quantidade: 1 }]); setUsuarioId(''); setObservacao(''); setModalAberto(true); }}>+ Novo Pedido</button>
      </div>

      {mensagem.texto && (
        <div className={`alerta alerta-${mensagem.tipo === 'erro' ? 'erro' : 'sucesso'}`}>
          {mensagem.tipo === 'erro' ? '⚠️' : '✅'} {mensagem.texto}
        </div>
      )}

      <div className="card" style={{ padding: '12px 24px' }}>
        <div className="barra-busca">
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <table className="tabela">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Itens</th>
              <th>Total</th>
              <th>Status</th>
              <th>Data</th>
              {isInterno && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#999', padding: 32 }}>Nenhum pedido encontrado.</td></tr>
            ) : pedidosFiltrados.map(p => (
              <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => { setPedidoAtual(p); setDetalhesAberto(true); }}>
                <td style={{ color: '#aaa', fontSize: '0.8rem' }}>#{p.id}</td>
                <td style={{ fontWeight: 600 }}>{p.usuario?.nome}</td>
                <td>{p.itens?.length || 0} item(s)</td>
                <td style={{ fontWeight: 700, color: '#2C1A0E' }}>R$ {Number(p.total).toFixed(2)}</td>
                <td onClick={e => e.stopPropagation()}>
                  {isInterno ? (
                    <select
                      value={p.status}
                      onChange={e => mudarStatus(p.id, e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer' }}
                    >
                      {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  ) : (
                    <span className={`badge badge-${STATUS_COR[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                  )}
                </td>
                <td style={{ color: '#777', fontSize: '0.82rem' }}>{new Date(p.criadoEm).toLocaleString('pt-BR')}</td>
                {isInterno && <td><span style={{ color: '#aaa', fontSize: '0.8rem' }}>clique para ver</span></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Novo Pedido */}
      {modalAberto && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalAberto(false)}>
          <div className="modal" style={{ maxWidth: 580 }}>
            <div className="modal-cabecalho">
              <h3>+ Novo Pedido (Takeaway)</h3>
              <button className="modal-fechar" onClick={() => setModalAberto(false)}>×</button>
            </div>
            <form onSubmit={criarPedido}>
              {isInterno && (
                <div className="form-grupo">
                  <label>Cliente *</label>
                  <select value={usuarioId} onChange={e => setUsuarioId(e.target.value)} required>
                    <option value="">Selecione o cliente</option>
                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome} — {u.email}</option>)}
                  </select>
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, fontSize: '0.82rem', display: 'block', marginBottom: 8 }}>Itens do Pedido *</label>
                {itens.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <select value={item.produtoId} onChange={e => updateItem(i, 'produtoId', e.target.value)} style={{ flex: 1, padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 7, fontSize: '0.875rem' }} required>
                      <option value="">Produto...</option>
                      {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} — R$ {Number(p.preco).toFixed(2)} (est: {p.estoque})</option>)}
                    </select>
                    <input type="number" min="1" value={item.quantidade} onChange={e => updateItem(i, 'quantidade', e.target.value)} style={{ width: 70, padding: '9px 10px', border: '1.5px solid #ddd', borderRadius: 7, fontSize: '0.875rem' }} required />
                    {itens.length > 1 && <button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>}
                  </div>
                ))}
                <button type="button" className="btn btn-secundario" style={{ fontSize: '0.82rem', padding: '6px 12px' }} onClick={addItem}>+ Adicionar item</button>
              </div>
              <div className="form-grupo">
                <label>Observação</label>
                <input value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Ex: sem açúcar, para viagem..." />
              </div>
              <div style={{ background: '#FDF6EC', borderRadius: 8, padding: '12px 16px', margin: '16px 0', fontWeight: 700, fontSize: '1.1rem', textAlign: 'right' }}>
                Total: R$ {calcularTotal().toFixed(2)}
              </div>
              <div className="modal-acoes">
                <button type="button" className="btn btn-secundario" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primario">Confirmar Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {detalhesAberto && pedidoAtual && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetalhesAberto(false)}>
          <div className="modal">
            <div className="modal-cabecalho">
              <h3>Pedido #{pedidoAtual.id}</h3>
              <button className="modal-fechar" onClick={() => setDetalhesAberto(false)}>×</button>
            </div>
            <p><strong>Cliente:</strong> {pedidoAtual.usuario?.nome}</p>
            <p style={{ margin: '6px 0' }}><strong>Status:</strong> <span className={`badge badge-${STATUS_COR[pedidoAtual.status]}`}>{STATUS_LABEL[pedidoAtual.status]}</span></p>
            {pedidoAtual.observacao && <p style={{ margin: '6px 0', color: '#777' }}><strong>Obs:</strong> {pedidoAtual.observacao}</p>}
            <div style={{ margin: '16px 0' }}>
              <strong style={{ display: 'block', marginBottom: 8 }}>Itens:</strong>
              {pedidoAtual.itens?.map(it => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0e8dc', fontSize: '0.9rem' }}>
                  <span>{it.produto?.nome} × {it.quantidade}</span>
                  <span style={{ fontWeight: 600 }}>R$ {(Number(it.precoUnit) * it.quantidade).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem' }}>Total: R$ {Number(pedidoAtual.total).toFixed(2)}</div>
            <div className="modal-acoes">
              <button className="btn btn-secundario" onClick={() => setDetalhesAberto(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
