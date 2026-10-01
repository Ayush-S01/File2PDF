import { useRef, useState, useCallback } from 'react';
import { Upload, FolderOpen } from 'lucide-react';
import {
  validateFile,
  createUploadedFile,
  MAX_FILES,
} from '../utils/fileUtils';
import type { UploadedFile } from '../types/file';

interface UploadZoneProps {
  onFilesAdded: (files: UploadedFile[]) => void;
  existingCount?: number;
}

export default function UploadZone({ onFilesAdded, existingCount = 0 }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const processFiles = useCallback((rawFiles: FileList | File[]) => {
    const fileArray = Array.from(rawFiles);
    const newErrors: string[] = [];
    const validFiles: UploadedFile[] = [];

    const remaining = MAX_FILES - existingCount;

    if (fileArray.length > remaining) {
      newErrors.push(`You can upload a maximum of ${MAX_FILES} files at once. ${fileArray.length - remaining} file(s) were ignored.`);
    }

    const toProcess = fileArray.slice(0, remaining);

    for (const file of toProcess) {
      const err = validateFile(file);
      if (err) {
        newErrors.push(err);
      } else {
        validFiles.push(createUploadedFile(file));
      }
    }

    setErrors(newErrors);
    if (validFiles.length > 0) {
      onFilesAdded(validFiles);
    }
  }, [existingCount, onFilesAdded]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if leaving the zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) processFiles(files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleZoneClick = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div>
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onClick={handleZoneClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload files area – click or drag files here"
      >
        <div className="upload-zone-icon" aria-hidden="true">
          {isDragging
            ? <Upload size={32} strokeWidth={1.5} />
            : <FolderOpen size={32} strokeWidth={1.5} />
          }
        </div>

        <h2>{isDragging ? 'Drop Your Files Here' : 'Drag & Drop Your Files Here'}</h2>
        <p>or</p>

        <button
          className="btn-browse"
          onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
          type="button"
          aria-label="Browse files from your computer"
        >
          <Upload size={16} aria-hidden="true" />
          Browse Files
        </button>

        <p className="upload-zone-formats">
          DOCX • PPTX • XLSX • JPG • PNG • TXT • HTML • PDF and more
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".doc,.docx,.txt,.rtf,.odt,.ppt,.pptx,.odp,.xls,.xlsx,.ods,.csv,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.tif,.html,.htm,.pdf"
          onChange={handleInputChange}
          style={{ display: 'none' }}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div role="alert" aria-live="polite" style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {errors.map((err, i) => (
            <div key={i} className="error-banner">
              <svg className="error-banner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <p>{err}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
