import { FileText } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-logo">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#4f46e5"/>
              <path d="M8 6h10l6 6v14H8V6z" fill="white" opacity="0.9"/>
              <path d="M18 6l6 6h-6V6z" fill="#a5b4fc"/>
            </svg>
            <span>File2PDF</span>
          </div>

          <p className="footer-text">
            Convert. Preview. Download. &copy; {year} File2PDF
          </p>

          <div className="footer-links">
            <a href="#about" aria-label="About File2PDF">About</a>
            <a href="#formats" aria-label="Supported file formats">Formats</a>
            <a href="#how" aria-label="How it works">How It Works</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
