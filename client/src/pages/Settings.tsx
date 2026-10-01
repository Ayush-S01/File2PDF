import { RotateCcw } from 'lucide-react';
import type { UserSettings, ThemeMode } from '../types/file';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => void;
  onReset: () => void;
}

export default function Settings({ settings, onUpdate, onReset }: SettingsProps) {
  return (
    <main id="main" className="settings-page" tabIndex={-1}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Customize your File2PDF experience</p>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <h3>Appearance</h3>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <span className="form-label">Theme</span>
          <div className="theme-selector" role="radiogroup" aria-label="Theme">
            {(['light', 'dark', 'system'] as ThemeMode[]).map(mode => (
              <button
                key={mode}
                type="button"
                className={`theme-option ${settings.theme === mode ? 'selected' : ''}`}
                onClick={() => onUpdate({ theme: mode })}
                role="radio"
                aria-checked={settings.theme === mode}
              >
                {mode === 'light' ? '☀️ Light' : mode === 'dark' ? '🌙 Dark' : '⚙️ System'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Default Conversion */}
      <div className="settings-section">
        <h3>Default Conversion Options</h3>

        <div className="settings-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="default-page-size">Default Page Size</label>
            <select
              id="default-page-size"
              className="form-select"
              value={settings.defaultPageSize}
              onChange={e => onUpdate({ defaultPageSize: e.target.value as UserSettings['defaultPageSize'] })}
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="A5">A5</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="default-mode">Default Mode</label>
            <select
              id="default-mode"
              className="form-select"
              value={settings.defaultMode}
              onChange={e => onUpdate({ defaultMode: e.target.value as UserSettings['defaultMode'] })}
            >
              <option value="separate">Convert Separately</option>
              <option value="merge">Merge into One PDF</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="default-orientation">Default Orientation</label>
            <select
              id="default-orientation"
              className="form-select"
              value={settings.defaultOrientation}
              onChange={e => onUpdate({ defaultOrientation: e.target.value as UserSettings['defaultOrientation'] })}
            >
              <option value="auto">Automatic</option>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        </div>
      </div>

      {/* Limits */}
      <div className="settings-section">
        <h3>File Limits</h3>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <p><strong>Maximum file size:</strong> {settings.maxFileSizeMB} MB per file</p>
          <p><strong>Maximum files:</strong> 20 files per conversion</p>
          <p style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            These limits are configured server-side and cannot be changed from the UI.
          </p>
        </div>
      </div>

      {/* Reset */}
      <div className="settings-section" style={{ border: '1px solid var(--error)', background: 'rgba(239,68,68,0.04)' }}>
        <h3 style={{ color: 'var(--error)' }}>Reset Settings</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          Revert all settings to their defaults.
        </p>
        <button
          className="btn btn-secondary"
          onClick={onReset}
          type="button"
          aria-label="Reset all settings to defaults"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Reset Settings
        </button>
      </div>
    </main>
  );
}
