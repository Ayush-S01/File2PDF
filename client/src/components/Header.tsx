import { useState } from 'react';
import { FileText, Menu, X, Settings } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const NAV_LINKS = [
  { id: 'home',     label: 'Home' },
  { id: 'how',      label: 'How It Works' },
  { id: 'formats',  label: 'Supported Formats' },
  { id: 'about',    label: 'About' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (id: string) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <header className="header" role="banner">
        <div className="container">
          <div className="header-inner">
            {/* Logo */}
            <button
              className="header-logo"
              onClick={() => handleNav('home')}
              aria-label="File2PDF – go to home"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="#4f46e5"/>
                <path d="M8 6h10l6 6v14H8V6z" fill="white" opacity="0.9"/>
                <path d="M18 6l6 6h-6V6z" fill="#a5b4fc"/>
                <text x="10" y="24" fontSize="6" fontFamily="Arial" fontWeight="bold" fill="#4f46e5">PDF</text>
              </svg>
              <span>File2PDF</span>
            </button>

            {/* Desktop nav */}
            <nav className="header-nav" aria-label="Main navigation">
              {NAV_LINKS.map(link => (
                <button
                  key={link.id}
                  className={`nav-link ${currentPage === link.id ? 'active' : ''}`}
                  onClick={() => handleNav(link.id)}
                  aria-current={currentPage === link.id ? 'page' : undefined}
                >
                  {link.icon ? <link.icon size={16} aria-hidden="true" /> : null}
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Hamburger */}
            <button
              className="hamburger"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen(o => !o)}
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav
        id="mobile-nav"
        className={`mobile-nav ${menuOpen ? 'open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        {NAV_LINKS.map(link => (
          <button
            key={link.id}
            className={`nav-link ${currentPage === link.id ? 'active' : ''}`}
            onClick={() => handleNav(link.id)}
            tabIndex={menuOpen ? 0 : -1}
          >
            {link.icon ? <link.icon size={15} style={{ marginRight: 4 }} aria-hidden="true" /> : null}
            {link.label}
          </button>
        ))}
      </nav>
    </>
  );
}
