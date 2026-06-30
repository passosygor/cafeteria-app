import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const icones = {
  dashboard: '☕',
  produtos: '🧁',
  categorias: '🏷️',
  estoque: '📦',
  pedidos: '🧾',
  usuarios: '👥',
};

// Gera um SVG de QR code falso (padrão visual aleatório fixo)
function QRCodeFake({ valor }) {
  const size = 160;
  const cells = 19;
  const cell = size / cells;

  // Seed determinístico baseado no valor
  const seed = Array.from(String(valor)).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  function pseudo(i) {
    return ((seed * 9301 + i * 49297) % 233280) / 233280 > 0.5;
  }

  const squares = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      // Cantos fixos (padrão QR)
      const corner =
        (r < 7 && c < 7) ||
        (r < 7 && c >= cells - 7) ||
        (r >= cells - 7 && c < 7);
      const filled = corner ? (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) : pseudo(r * cells + c);
      if (filled) {
        squares.push(
          <rect key={`${r}-${c}`} x={c * cell + 2} y={r * cell + 2} width={cell - 1} height={cell - 1} fill="#1a1a1a" rx="1" />
        );
      }
    }
  }

  return (
    <svg width={size + 4} height={size + 4} viewBox={`0 0 ${size + 4} ${size + 4}`} style={{ background: '#fff', borderRadius: 8 }}>
      {squares}
    </svg>
  );
}

function ModalSaldo({ onClose, onConfirmar }) {
  const [etapa, setEtapa] = useState('input'); // 'input' | 'qr'
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState('');

  function irParaQR() {
    const v = parseFloat(valor.replace(',', '.'));
    if (!v || v <= 0) { setErro('Informe um valor válido.'); return; }
    if (v > 1000) { setErro('Valor máximo por recarga: R$ 1.000,00'); return; }
    setErro('');
    setEtapa('qr');
  }

  function concluir() {
    const v = parseFloat(valor.replace(',', '.'));
    onConfirmar(v);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <div className="modal-cabecalho">
          <h3>{etapa === 'input' ? '💳 Adicionar Saldo' : '📱 Escaneie o QR Code'}</h3>
          <button className="modal-fechar" onClick={onClose}>×</button>
        </div>

        {etapa === 'input' ? (
          <>
            <p style={{ color: '#757575', fontSize: '0.875rem', marginBottom: 20 }}>
              Informe o valor que deseja adicionar à sua carteira virtual.
            </p>
            <div className="form-grupo" style={{ textAlign: 'left' }}>
              <label>Valor (R$)</label>
              <input
                type="number"
                min="1"
                max="1000"
                step="0.01"
                placeholder="Ex: 50.00"
                value={valor}
                onChange={e => { setValor(e.target.value); setErro(''); }}
                style={{ fontSize: '1.2rem', textAlign: 'center', fontWeight: 600 }}
                autoFocus
              />
            </div>
            {erro && <div className="alerta alerta-erro" style={{ marginBottom: 12 }}>⚠️ {erro}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secundario" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
              <button className="btn btn-primario" style={{ flex: 1 }} onClick={irParaQR}>Gerar QR Code</button>
            </div>
          </>
        ) : (
          <>
            <p style={{ color: '#757575', fontSize: '0.875rem', marginBottom: 16 }}>
              Use o app do seu banco para pagar via Pix.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <QRCodeFake valor={valor} />
            </div>
            <div style={{
              background: '#f3e8d8',
              borderRadius: 8,
              padding: '10px 16px',
              marginBottom: 20,
              fontSize: '0.82rem',
              color: '#6B3A2A',
            }}>
              💰 Valor a pagar: <strong>R$ {parseFloat(valor.replace(',', '.')).toFixed(2)}</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: 16 }}>
              ⚠️ Simulação — nenhuma cobrança real será feita.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secundario" style={{ flex: 1 }} onClick={() => setEtapa('input')}>← Voltar</button>
              <button className="btn btn-sucesso" style={{ flex: 1 }} onClick={concluir}>✅ Pagamento Concluído</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [modalSaldo, setModalSaldo] = useState(false);
  const [saldo, setSaldo] = useState(() => {
    const s = localStorage.getItem('saldo');
    return s ? parseFloat(s) : 0;
  });

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const isAdmin = usuario.role === 'ADMIN';
  const isInterno = ['ADMIN', 'FUNCIONARIO'].includes(usuario.role);
  const isCliente = usuario.role === 'CLIENTE';

  function sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  }

  function adicionarSaldo(valor) {
    const novoSaldo = saldo + valor;
    setSaldo(novoSaldo);
    localStorage.setItem('saldo', novoSaldo.toFixed(2));
  }

  const roleLabel = { ADMIN: 'Administrador', FUNCIONARIO: 'Funcionário', CLIENTE: 'Cliente' };

  return (
    <div className="layout">
      {/* Botão toggle da sidebar */}
      <button
        className="sidebar-toggle" style={{ left: sidebarAberta ? 240 : 14 }}
        onClick={() => setSidebarAberta(!sidebarAberta)}
        title={sidebarAberta ? 'Ocultar menu' : 'Mostrar menu'}
      >
        {sidebarAberta ? '◀' : '▶'}
      </button>

      <aside className={`sidebar ${sidebarAberta ? '' : 'sidebar-fechada'}`}>
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

          {/* Carteira — visível para clientes e admins */}
          {(isCliente || isAdmin) && (
            <div className="carteira">
              <div className="carteira-saldo">
                <span>💰 Saldo</span>
                <strong>R$ {saldo.toFixed(2)}</strong>
              </div>
              <button className="btn-saldo" onClick={() => setModalSaldo(true)}>
                + Adicionar Saldo
              </button>
            </div>
          )}

          <button className="btn-sair" onClick={sair}>Sair</button>
        </div>
      </aside>

      <main className={`conteudo ${sidebarAberta ? '' : 'conteudo-expandido'}`}>
        <Outlet />
      </main>

      {modalSaldo && (
        <ModalSaldo
          onClose={() => setModalSaldo(false)}
          onConfirmar={adicionarSaldo}
        />
      )}
    </div>
  );
}
