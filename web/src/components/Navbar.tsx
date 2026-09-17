import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/accommodation', label: 'Rooms' },
  { to: '/location', label: 'Location' },
  { to: '/privacy', label: 'Privacy' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the menu on navigation + Escape.
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Primary">
        <Link to="/" className="brand" aria-label="Riverside Guest House — home">
          <img src="/icon.svg" alt="" width="32" height="32" aria-hidden="true" />
          <span>Riverside</span>
        </Link>
        <div className="nav-links">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {l.label}
            </NavLink>
          ))}
        </div>
        <Link to="/booking" className="cta">Book</Link>
        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true">{open ? '✕' : '☰'}</span>
        </button>
      </nav>
      {open && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/booking" className="btn">Book on WhatsApp</Link>
        </nav>
      )}
    </header>
  );
}
