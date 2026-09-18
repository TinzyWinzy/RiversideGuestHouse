import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Button } from './Button';
import { CloseIcon, MenuIcon, WhatsAppIcon } from './icons';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/accommodation', label: 'Rooms' },
  { to: '/location', label: 'Location' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  // Slightly different styling when page is scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`} aria-label="Site header">
      <nav className="navbar" aria-label="Primary">
        <Link to="/" className="brand" aria-label="Riverside Guest House — home">
          <img src="/icon.svg" alt="" width="34" height="34" aria-hidden="true" />
          <div className="brand-text">
            <span className="brand-name">Riverside</span>
            <span className="brand-sub">Guest House · Ruwa</span>
          </div>
        </Link>

        <div className="nav-links">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <Link to="/booking" className="cta" id="navbar-book-btn">
          Book Now
        </Link>

        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true">{open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}</span>
        </button>
      </nav>

      {open && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {l.label}
            </NavLink>
          ))}
          <Button href="/booking" id="mobile-book-btn">
            <WhatsAppIcon size={18} />
            Book on WhatsApp
          </Button>
        </nav>
      )}
    </header>
  );
}
