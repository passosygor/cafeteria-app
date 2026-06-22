import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ produtos: 0, baixoEstoque: 0, pedidos: 0, usuarios: 0 });
  const [baixos, setBaixos] = useState([]);
  const [pedidosRecentes, setPedidosRecentes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const isInterno = ['ADMIN', 'FUNCIONARIO'].includes(usuario.role);

  useEffect(() => {
    async function carregar() {
      try {
        const [prodRes, pedRes] = await Promise.all([
          api.get('/produtos'),
          api.get('/pedidos'),
        ]);

        const prods = prodRes.data;
        const baixosList = prods.filter(p => p.estoque <= p.estoqueMin);
        setBaixos(baixosList.slice(0, 5));
        setPedidosRecentes(pedRes.data.slice(0, 5));

        setStats({
          produtos: prods.length,
          baixoEstoque: baixosList.length,
          pedidos: pedRes.data.length,
          pedidosPendentes: pedRes.data.filter(p => p.status === 'PENDENTE').length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const statusCor = { PENDENTE: 'amarelo', EM_PREPARO: 'cafe', PRONTO: 'verde', RETIRADO: 'cinza', CANCELADO: 'vermelho' };
  const statusLabel = { PENDENTE: 'Pendente', EM_PREPARO: 'Em Preparo', PRONTO: 'Pronto', RETIRADO: 'Retirado', CANCELADO: 'Cancelado' };

  if (carregando) return <div style={{ padding: 40, color: '#999' }}>Carregando...</div>;

  return (
    <div>
      <div className="pagina-topo">
        <div>
          <div className="pagina-titulo">Dashboard</div>
          <div className="pagina-subtitulo">Bem-vindo(a), {usuario.nome} 👋</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Produtos Ativos</h4>
          <div className="valor">{stats.produtos}</div>
          <div className="detalhe">no cardápio</div>
        </div>
        {isInterno && (
          <div className="stat-card" style={{ borderLeftColor: stats.baixoEstoque > 0 ? '#C62828' : '#2E7D32' }}>
            <h4>Estoque Baixo</h4>
            <div className="valor">{stats.baixoEstoque}</div>
            <div className="detalhe">{stats.baixoEstoque > 0 ? 'precisam de reposição' : 'tudo em ordem!'}</div>
          </div>
        )}
        <div className="stat-card">
          <h4>Pedidos Pendentes</h4>
          <div className="valor">{stats.pedidosPendentes}</div>
          <div className="detalhe">aguardando preparo</div>
        </div>
        <div className="stat-card">
          <h4>Total de Pedidos</h4>
          <div className="valor">{stats.pedidos}</div>
          <div className="detalhe">registrados no sistema</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isInterno ? '1fr 1fr' : '1fr', gap: 20 }}>
        <div className="card">
          <div className="card-titulo">🧾 Pedidos Recentes</div>
          {pedidosRecentes.length === 0 ? (
            <p style={{ color: '#999', fontSize: '0.875rem' }}>Nenhum pedido ainda.</p>
          ) : (
            <div className="tabela-wrapper">
              <table className="tabela">
                <thead><tr><th>#</th><th>Cliente</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {pedidosRecentes.map(p => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td>{p.usuario?.nome}</td>
                      <td>R$ {Number(p.total).toFixed(2)}</td>
                      <td><span className={`badge badge-${statusCor[p.status]}`}>{statusLabel[p.status]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {isInterno && (
          <div className="card">
            <div className="card-titulo">⚠️ Produtos com Estoque Baixo</div>
            {baixos.length === 0 ? (
              <p style={{ color: '#2E7D32', fontSize: '0.875rem' }}>✅ Todos os produtos estão bem abastecidos!</p>
            ) : (
              <div className="tabela-wrapper">
                <table className="tabela">
                  <thead><tr><th>Produto</th><th>Atual</th><th>Mínimo</th></tr></thead>
                  <tbody>
                    {baixos.map(p => (
                      <tr key={p.id}>
                        <td>{p.nome}</td>
                        <td><span className="badge badge-vermelho">{p.estoque}</span></td>
                        <td>{p.estoqueMin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
