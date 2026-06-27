import { NavLink } from 'react-router-dom';
import { LayoutGrid, BedDouble, Users, ClipboardList, MessageSquare, Newspaper, LogOut, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const LINKS = [
  { to: '/', label: 'Overview', icon: LayoutGrid },
  { to: '/rooms', label: 'Rooms', icon: BedDouble },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/news', label: 'News & Updates', icon: Newspaper },
];

export default function Sidebar() {
  const { account, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">GS</span>
        <div>
          <p className="brand-title">GS Hotel</p>
          <p className="brand-sub">Admin Panel</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
          >
            <link.icon size={18} strokeWidth={1.8} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {account && <p className="sidebar-account">Signed in as {account.full_name || account.username}</p>}
        <NavLink to="/account" className="sidebar-link">
          <KeyRound size={18} strokeWidth={1.8} /> Change password
        </NavLink>
        <button className="sidebar-link sidebar-logout" onClick={logout}>
          <LogOut size={18} strokeWidth={1.8} /> Sign out
        </button>
      </div>
    </aside>
  );
}
