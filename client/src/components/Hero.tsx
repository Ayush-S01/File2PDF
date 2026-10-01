import { ArrowRight, Zap, Shield, MousePointerClick } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="container">
        <h1 id="hero-heading">Convert Any File to PDF</h1>
        <p className="hero-subtitle">
          Convert documents, presentations, spreadsheets, images and more
          into high-quality PDF files — fast and effortlessly.
        </p>

        <button className="hero-cta" onClick={onStart} aria-label="Start converting files">
          Start Converting
          <ArrowRight size={18} aria-hidden="true" />
        </button>

        <div className="hero-trust" role="list" aria-label="Key features">
          <span role="listitem">
            <Zap size={14} aria-hidden="true" />
            Fast
          </span>
          <span role="listitem">
            <Shield size={14} aria-hidden="true" />
            Secure
          </span>
          <span role="listitem">
            <MousePointerClick size={14} aria-hidden="true" />
            Easy to Use
          </span>
        </div>
      </div>
    </section>
  );
}
