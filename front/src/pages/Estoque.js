import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

export default function Estoque() {
  const [movimentos, setMovimentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const { data } = await api.get('/estoque');
      setMovimentos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function formatarData(d) {
    return new Date(d).toLocaleString('pt-BR');
  }

  if (carregando) return <div style={{ padding: 40, color: '#999' }}>Carregando...</div>;

  return (
    <div>
      <div className="pagina-topo">
        <div>
          <div className="pagina-titulo">📦 Movimentação de Estoque</div>
          <div className="pagina-subtitulo">Últimas {movimentos.length} movimentações registradas</div>
        </div>
      </div>

      <div className="alerta alerta-aviso">
        💡 Para registrar entradas ou saídas, acesse a página de <strong>Produtos</strong> e clique no botão 📦 do produto desejado.
      </div>

      <div className="card">
        <table className="tabela">
          <thead>
            <tr>
              <th>#</th>
              <th>Produto</th>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Observação</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {movimentos.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#999', padding: 32 }}>Nenhuma movimentação encontrada.</td></tr>
            ) : movimentos.map(m => (
              <tr key={m.id}>
                <td style={{ color: '#aaa', fontSize: '0.8rem' }}>#{m.id}</td>
                <td style={{ fontWeight: 600 }}>{m.produto?.nome}</td>
                <td>
                  <span className={`badge badge-${m.tipo === 'ENTRADA' ? 'verde' : 'vermelho'}`}>
                    {m.tipo === 'ENTRADA' ? '📥 Entrada' : '📤 Saída'}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{m.quantidade}</td>
                <td style={{ color: '#777' }}>{m.observacao || '—'}</td>
                <td style={{ color: '#777', fontSize: '0.82rem' }}>{formatarData(m.criadoEm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
