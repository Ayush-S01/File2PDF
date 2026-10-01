import { useState } from 'react';
import { Download, Eye, RefreshCw, CheckCircle, AlertCircle, Archive } from 'lucide-react';
import PDFPreview from './PDFPreview';
import type { ConversionResult, FileConversionStatus } from '../types/file';
import { getDownloadUrl, getPreviewUrl } from '../services/api';

interface PDFResultProps {
  results: ConversionResult[];
  statuses: FileConversionStatus[];
  onStartNew: () => void;
}

export default function PDFResult({ results, statuses, onStartNew }: PDFResultProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(
    results.length === 1 ? 0 : null
  );
  const [editingName, setEditingName] = useState<Record<number, string>>({});

  const failed = statuses.filter(s => s.status === 'failed');

  const handleDownload = (result: ConversionResult, idx: number) => {
    const customName = editingName[idx];
    const url = getDownloadUrl(result.filename, customName || result.originalName);
    const a = document.createElement('a');
    a.href = url;
    a.download = customName ? `${customName}.pdf` : result.originalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    results.forEach((r, i) => {
      setTimeout(() => handleDownload(r, i), i * 300);
    });
  };

  return (
    <div className="result-container">
      {/* Success banner */}
      <div className="result-success-banner" role="alert" aria-live="polite">
        <CheckCircle size={24} color="#059669" aria-hidden="true" />
        <div>
          <h2>Conversion Complete!</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {results.length} PDF{results.length !== 1 ? 's' : ''} ready for download.
          </p>
        </div>
      </div>

      {/* Failed files warning */}
      {failed.length > 0 && (
        <div className="error-banner" style={{ marginBottom: 16 }} role="alert">
          <AlertCircle size={18} className="error-banner-icon" aria-hidden="true" />
          <p>
            {failed.length} file{failed.length !== 1 ? 's' : ''} could not be converted:{' '}
            {failed.map(f => f.originalName).join(', ')}
          </p>
        </div>
      )}

      {/* Result items */}
      <div className="result-items">
        {results.map((result, idx) => (
          <div key={idx} className="result-item">
            <div className="result-item-header">
              <div className="result-item-name">
                📕
                {/* Editable filename */}
                <input
                  type="text"
                  value={editingName[idx] ?? result.originalName.replace('.pdf', '')}
                  onChange={e => setEditingName(prev => ({ ...prev, [idx]: e.target.value }))}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    background: 'var(--bg)',
                    color: 'var(--text-primary)',
                    width: 'auto',
                    minWidth: 120,
                  }}
                  aria-label={`Output filename for ${result.originalName}`}
                />
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.85rem' }}>.pdf</span>
              </div>

              <div className="result-item-actions">
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                  onClick={() => setPreviewIndex(previewIndex === idx ? null : idx)}
                  aria-label={`${previewIndex === idx ? 'Hide' : 'Show'} preview for ${result.originalName}`}
                  type="button"
                >
                  <Eye size={15} aria-hidden="true" />
                  {previewIndex === idx ? 'Hide Preview' : 'Preview'}
                </button>

                <button
                  className="btn btn-primary"
                  style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                  onClick={() => handleDownload(result, idx)}
                  aria-label={`Download ${result.originalName}`}
                  type="button"
                >
                  <Download size={15} aria-hidden="true" />
                  Download
                </button>
              </div>
            </div>

            {/* Preview panel */}
            {previewIndex === idx && (
              <div style={{ padding: '0 0 0 0' }}>
                <PDFPreview
                  url={getPreviewUrl(result.filename)}
                  filename={result.originalName}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bulk actions */}
      {results.length > 1 && (
        <button
          className="btn btn-outline"
          style={{ marginBottom: 16 }}
          onClick={handleDownloadAll}
          aria-label="Download all PDF files"
          type="button"
        >
          <Archive size={16} aria-hidden="true" />
          Download All ({results.length} files)
        </button>
      )}

      {/* Start new */}
      <button
        className="btn btn-secondary"
        style={{ width: '100%' }}
        onClick={onStartNew}
        aria-label="Start a new conversion"
        type="button"
      >
        <RefreshCw size={16} aria-hidden="true" />
        Convert Another File
      </button>
    </div>
  );
}
