import { NavLink } from 'react-router-dom';
import { LayoutGrid, ShieldCheck, BedDouble, BarChart3 } from 'lucide-react';

const LINKS = [
  { to: '/', label: 'Overview', icon: LayoutGrid },
  { to: '/approvals', label: 'Approvals', icon: ShieldCheck },
  { to: '/rooms', label: 'Room status', icon: BedDouble },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">GS</span>
        <div>
          <p className="brand-title">GS Hotel</p>
          <p className="brand-sub">Controller Panel</p>
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
