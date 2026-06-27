import { NavLink } from 'react-router-dom';
import { LayoutGrid, ShieldCheck, BedDouble, BarChart3, Users, LogOut, KeyRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const LINKS = [
  { to: '/', label: 'Overview', icon: LayoutGrid },
  { to: '/approvals', label: 'Approvals', icon: ShieldCheck },
  { to: '/rooms', label: 'Room status', icon: BedDouble },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admins', label: 'Manage admins', icon: Users },
];

export default function Sidebar({ isOpen, onClose }) {
  const { account, logout } = useAuth();

  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? 'is-open' : ''}`} onClick={onClose} />

      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">GS</span>
          <div>
            <p className="brand-title">GS Hotel</p>
            <p className="brand-sub">Controller Panel</p>
          </div>
          <button className="mobile-menu-btn sidebar-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
              onClick={onClose}
            >
              <link.icon size={18} strokeWidth={1.8} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {account && <p className="sidebar-account">Signed in as {account.full_name || account.username}</p>}
          <NavLink to="/account" className="sidebar-link" onClick={onClose}>
            <KeyRound size={18} strokeWidth={1.8} /> Change password
          </NavLink>
          <button className="sidebar-link sidebar-logout" onClick={logout}>
            <LogOut size={18} strokeWidth={1.8} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
