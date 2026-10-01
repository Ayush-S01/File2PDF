import { X, GripVertical, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { UploadedFile } from '../types/file';
import { formatFileSize, getFileTypeLabel, getCategoryIcon } from '../utils/fileUtils';

interface FileItemProps {
  file: UploadedFile;
  onRemove: (id: string) => void;
  showDragHandle?: boolean;
  index: number;
}

function StatusBadge({ status, error }: { status: UploadedFile['status']; error?: string }) {
  switch (status) {
    case 'ready':
      return <span className="file-item-status status-ready"><CheckCircle size={12} /> Ready</span>;
    case 'converting':
      return <span className="file-item-status status-converting"><Loader2 size={12} className="spin" /> Converting...</span>;
    case 'done':
      return <span className="file-item-status status-done"><CheckCircle size={12} /> Done</span>;
    case 'error':
      return <span className="file-item-status status-error" title={error}><AlertCircle size={12} /> Failed</span>;
    default:
      return null;
  }
}

export default function FileItem({ file, onRemove, showDragHandle = false, index }: FileItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`file-item ${isDragging ? 'dragging-item' : ''}`}
      role="listitem"
      aria-label={`File: ${file.name}, ${getFileTypeLabel(file.name)}, ${formatFileSize(file.size)}`}
    >
      {/* Drag handle */}
      {showDragHandle && (
        <button
          className="file-item-drag"
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder: ${file.name}`}
          title="Drag to reorder"
          type="button"
        >
          <GripVertical size={18} aria-hidden="true" />
        </button>
      )}

      {/* Order number when in merge mode */}
      {showDragHandle && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 20, textAlign: 'center' }}>
          {index + 1}
        </span>
      )}

      {/* Icon */}
      <div className="file-item-icon" aria-hidden="true">
        {getCategoryIcon(file.category)}
      </div>

      {/* Info */}
      <div className="file-item-info">
        <div className="file-item-name" title={file.name}>{file.name}</div>
        <div className="file-item-meta">
          {getFileTypeLabel(file.name)} • {formatFileSize(file.size)}
          {file.error && (
            <span style={{ color: 'var(--error)', marginLeft: 8 }}>{file.error}</span>
          )}
        </div>
      </div>

      {/* Status */}
      <StatusBadge status={file.status} error={file.error} />

      {/* Remove button */}
      <button
        className="btn-remove"
        onClick={() => onRemove(file.id)}
        aria-label={`Remove ${file.name}`}
        title="Remove file"
        type="button"
        disabled={file.status === 'converting'}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
