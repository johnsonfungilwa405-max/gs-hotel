import { NavLink } from 'react-router-dom';
import { LayoutGrid, BedDouble, Users, ClipboardList, MessageSquare, Newspaper } from 'lucide-react';
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
    </aside>
  );
}
