import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Settings from './pages/Settings';
import { useSettings } from './hooks/useSettings';
import type { ConversionSettings } from './types/file';

export default function App() {
  const [page, setPage] = useState('home');
  const { settings, updateSettings, resetSettings } = useSettings();

  // Derive default ConversionSettings from user preferences
  const defaultConversionSettings: ConversionSettings = {
    mode:         settings.defaultMode,
    pageSize:     settings.defaultPageSize,
    orientation:  settings.defaultOrientation,
    margins:      'default',
    imageQuality: 'high',
  };

  const handleNavigate = (target: string) => {
    if (target === 'how' || target === 'formats') {
      // These are sections on the home page
      setPage('home');
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      setPage(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="app-root">
      <Header currentPage={page} onNavigate={handleNavigate} />

      <div className="main-content">
        {page === 'home' && (
          <Home defaultSettings={defaultConversionSettings} />
        )}
        {page === 'about' && <About />}
        {page === 'settings' && (
          <Settings
            settings={settings}
            onUpdate={updateSettings}
            onReset={resetSettings}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
