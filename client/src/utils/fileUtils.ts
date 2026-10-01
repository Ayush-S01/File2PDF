import type { FileCategory, UploadedFile } from '../types/file';

// Supported extensions by category
export const SUPPORTED_EXTENSIONS: Record<string, FileCategory> = {
  doc: 'document', docx: 'document', txt: 'text', rtf: 'document', odt: 'document',
  ppt: 'presentation', pptx: 'presentation', odp: 'presentation',
  xls: 'spreadsheet', xlsx: 'spreadsheet', ods: 'spreadsheet', csv: 'spreadsheet',
  jpg: 'image', jpeg: 'image', png: 'image', webp: 'image', bmp: 'image', tiff: 'image', tif: 'image',
  html: 'web', htm: 'web',
  pdf: 'pdf',
};

export const MAX_FILE_SIZE_MB = 50;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_FILES = 20;

/**
 * Get file extension (lowercase, without dot)
 */
export function getExtension(filename: string): string {
  const parts = filename.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * Get file category from extension
 */
export function getFileCategory(filename: string): FileCategory {
  const ext = getExtension(filename);
  return SUPPORTED_EXTENSIONS[ext] || 'unknown';
}

/**
 * Check if file is supported
 */
export function isFileSupported(file: File): boolean {
  const ext = getExtension(file.name);
  return ext in SUPPORTED_EXTENSIONS;
}

/**
 * Validate a file — returns error string or null
 */
export function validateFile(file: File): string | null {
  if (!isFileSupported(file)) {
    const ext = getExtension(file.name);
    return `Unsupported file format ".${ext}". Please upload a supported file type.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`;
  }
  if (file.size === 0) {
    return `"${file.name}" is empty and cannot be converted.`;
  }
  return null;
}

/**
 * Format bytes to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get display label for file type
 */
export function getFileTypeLabel(filename: string): string {
  return getExtension(filename).toUpperCase();
}

/**
 * Get emoji icon for file category
 */
export function getCategoryIcon(category: FileCategory): string {
  switch (category) {
    case 'document': return '📄';
    case 'presentation': return '📊';
    case 'spreadsheet': return '📈';
    case 'image': return '🖼️';
    case 'web': return '🌐';
    case 'pdf': return '📕';
    case 'text': return '📝';
    default: return '📎';
  }
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create UploadedFile from File
 */
export function createUploadedFile(file: File): UploadedFile {
  const category = getFileCategory(file.name);
  return {
    id: generateId(),
    file,
    name: file.name,
    size: file.size,
    extension: getExtension(file.name),
    category,
    status: 'ready',
  };
}

/**
 * Sanitize a filename for output
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}
