import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Droplets, History, BarChart2,
  Lightbulb, User, LogOut, Plus, Menu, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/novo-consumo', icon: <Plus size={18} />, label: 'Novo Consumo' },
  { to: '/historico', icon: <History size={18} />, label: 'Histórico' },
  { to: '/graficos', icon: <BarChart2 size={18} />, label: 'Gráficos' },
  { to: '/dicas', icon: <Lightbulb size={18} />, label: 'Dicas' },
  { to: '/perfil', icon: <User size={18} />, label: 'Perfil' },
];

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-layout">
      {/* Sidebar overlay mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌿</div>
          <div>
            <div className="sidebar-logo-text">Consumo</div>
            <div className="sidebar-logo-sub">Consciente</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ padding: '8px 12px 12px', fontSize: 13, color: 'var(--color-gray-500)' }}>
            <div style={{ fontWeight: 600, color: 'var(--color-gray-700)', marginBottom: 2 }}>
              {usuario?.nome}
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {usuario?.email}
            </div>
          </div>
          <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--color-danger)' }}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Mobile header */}
        <header className="mobile-header">
          <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
            <Menu size={22} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15 }}>
            🌿 Consumo Consciente
          </div>
          <button className="hamburger" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu" style={{ opacity: 0 }} tabIndex={-1}>
            <X size={22} />
          </button>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
