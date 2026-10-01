// ── File upload state ─────────────────────────────────────────────────────────

export type FileStatus = 'idle' | 'ready' | 'uploading' | 'converting' | 'done' | 'error';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  extension: string;
  category: FileCategory;
  status: FileStatus;
  error?: string;
}

export type FileCategory =
  | 'document'
  | 'presentation'
  | 'spreadsheet'
  | 'image'
  | 'web'
  | 'pdf'
  | 'text'
  | 'unknown';

// ── Conversion settings ────────────────────────────────────────────────────────

export type ConversionMode = 'separate' | 'merge';
export type PageSize = 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal';
export type Orientation = 'portrait' | 'landscape' | 'auto';
export type Margins = 'default' | 'narrow' | 'none';
export type ImageQuality = 'standard' | 'high' | 'maximum';

export interface ConversionSettings {
  mode: ConversionMode;
  pageSize: PageSize;
  orientation: Orientation;
  margins: Margins;
  imageQuality: ImageQuality;
}

// ── API response types ─────────────────────────────────────────────────────────

export interface ConversionResult {
  filename: string;
  originalName: string;
  downloadUrl: string;
}

export interface FileConversionStatus {
  originalName: string;
  status: 'success' | 'failed';
  pdfName?: string;
  error?: string;
}

export interface ConversionResponse {
  mode: ConversionMode;
  conversions: FileConversionStatus[];
  result: ConversionResult[];
}

// ── App state ─────────────────────────────────────────────────────────────────

export type AppStep = 'upload' | 'converting' | 'result' | 'error';

export interface AppState {
  step: AppStep;
  files: UploadedFile[];
  settings: ConversionSettings;
  conversionResults: ConversionResult[];
  conversionStatuses: FileConversionStatus[];
  globalError: string | null;
}

// ── Settings (persisted) ───────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserSettings {
  theme: ThemeMode;
  defaultPageSize: PageSize;
  defaultMode: ConversionMode;
  defaultOrientation: Orientation;
  maxFileSizeMB: number;
}
