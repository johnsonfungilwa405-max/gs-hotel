import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <div className="mobile-topbar">
        <div className="mobile-topbar-brand">
          <span className="brand-mark">GS</span>
          <p className="brand-title">GS Hotel</p>
        </div>
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
      </div>

      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="main-panel">
        <Outlet />
      </div>
    </div>
  );
}
