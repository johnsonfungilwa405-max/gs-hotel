import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, Moon, Menu, X, UserRound } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCustomer } from '../context/CustomerContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/news', label: 'News & Updates' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { customer } = useCustomer();
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="navbar-brand" onClick={() => setOpen(false)}>
          <span className="navbar-brand-mark">GS</span>
          <span className="navbar-brand-text">GS Hotel</span>
        </NavLink>

        <nav className={`navbar-links ${open ? 'is-open' : ''}`}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `navbar-link ${isActive ? 'is-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            className={({ isActive }) => `navbar-link navbar-profile ${isActive ? 'is-active' : ''}`}
            onClick={() => setOpen(false)}
          >
            <UserRound size={16} strokeWidth={2} />
            {customer ? customer.customer_code : 'Profile'}
          </NavLink>
        </nav>

        <div className="navbar-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="navbar-burger" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
