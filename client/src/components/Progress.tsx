import { CheckCircle, Loader2, Circle, XCircle } from 'lucide-react';
import type { UploadedFile } from '../types/file';

interface ProgressProps {
  files: UploadedFile[];
  progress: number;
  currentFile?: string;
}

export default function Progress({ files, progress, currentFile }: ProgressProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div
      className="progress-container"
      role="status"
      aria-live="polite"
      aria-label={`Converting files, ${clampedProgress}% complete`}
    >
      <h2 className="progress-title">Converting Files</h2>
      <p className="progress-subtitle">
        {currentFile ? `Processing: ${currentFile}` : 'Preparing your PDFs...'}
      </p>

      {/* Progress bar */}
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="progress-bar-wrapper" role="progressbar" aria-valuenow={clampedProgress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar" style={{ width: `${clampedProgress}%` }} />
        </div>
        <p className="progress-percent">{clampedProgress}%</p>
      </div>

      {/* Per-file status */}
      {files.length > 0 && (
        <div className="progress-files" aria-label="File conversion status">
          {files.map(file => (
            <div
              key={file.id}
              className={`progress-file-item ${
                file.status === 'done' ? 'done'
                : file.status === 'converting' ? 'active'
                : file.status === 'error' ? 'failed'
                : ''
              }`}
              aria-label={`${file.name}: ${file.status}`}
            >
              {file.status === 'done' && <CheckCircle size={14} aria-hidden="true" />}
              {file.status === 'converting' && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />}
              {file.status === 'error' && <XCircle size={14} aria-hidden="true" />}
              {(file.status === 'ready' || file.status === 'idle') && <Circle size={14} aria-hidden="true" />}
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
