import { FilePlus, Files, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { ConversionSettings, PageSize, Orientation, Margins, ImageQuality, ConversionMode } from '../types/file';

interface ConversionSettingsProps {
  settings: ConversionSettings;
  onChange: (updates: Partial<ConversionSettings>) => void;
  fileCount: number;
}

export default function ConversionSettingsPanel({
  settings,
  onChange,
  fileCount,
}: ConversionSettingsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="conversion-settings">
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>
        Conversion Options
      </h2>

      {/* Mode selector */}
      <div className="mode-selector" role="radiogroup" aria-label="Conversion mode">
        <button
          className={`mode-card ${settings.mode === 'separate' ? 'selected' : ''}`}
          onClick={() => onChange({ mode: 'separate' })}
          role="radio"
          aria-checked={settings.mode === 'separate'}
          type="button"
        >
          <div className="mode-card-title">
            <FilePlus size={16} aria-hidden="true" />
            Convert Separately
          </div>
          <p className="mode-card-desc">
            Each file becomes its own PDF
          </p>
        </button>

        <button
          className={`mode-card ${settings.mode === 'merge' ? 'selected' : ''}`}
          onClick={() => onChange({ mode: 'merge' })}
          role="radio"
          aria-checked={settings.mode === 'merge'}
          type="button"
          aria-disabled={fileCount < 2}
          title={fileCount < 2 ? 'Add at least 2 files to merge' : undefined}
        >
          <div className="mode-card-title">
            <Files size={16} aria-hidden="true" />
            Merge into One PDF
          </div>
          <p className="mode-card-desc">
            All files combined into a single PDF
          </p>
        </button>
      </div>

      {settings.mode === 'merge' && fileCount >= 2 && (
        <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: 16, background: 'var(--primary-50)', padding: '8px 12px', borderRadius: 8 }}>
          💡 Drag file cards to reorder them — this determines the page order in the merged PDF.
        </p>
      )}

      {/* Advanced settings toggle */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          fontWeight: 500,
        }}
        aria-expanded={expanded}
        aria-controls="pdf-settings"
      >
        {expanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
        PDF Settings
      </button>

      {expanded && (
        <div id="pdf-settings" className="settings-grid" style={{ marginTop: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="page-size">Page Size</label>
            <select
              id="page-size"
              className="form-select"
              value={settings.pageSize}
              onChange={e => onChange({ pageSize: e.target.value as PageSize })}
              aria-label="Page size"
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="A5">A5</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="orientation">Orientation</label>
            <select
              id="orientation"
              className="form-select"
              value={settings.orientation}
              onChange={e => onChange({ orientation: e.target.value as Orientation })}
              aria-label="Page orientation"
            >
              <option value="auto">Automatic</option>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="margins">Margins</label>
            <select
              id="margins"
              className="form-select"
              value={settings.margins}
              onChange={e => onChange({ margins: e.target.value as Margins })}
              aria-label="Page margins"
            >
              <option value="default">Default</option>
              <option value="narrow">Narrow</option>
              <option value="none">None</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="image-quality">Image Quality</label>
            <select
              id="image-quality"
              className="form-select"
              value={settings.imageQuality}
              onChange={e => onChange({ imageQuality: e.target.value as ImageQuality })}
              aria-label="Image quality"
            >
              <option value="standard">Standard</option>
              <option value="high">High</option>
              <option value="maximum">Maximum</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
