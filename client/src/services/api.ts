import axios from 'axios';
import type { ConversionSettings, ConversionResponse } from '../types/file';

const api = axios.create({
  baseURL: '/api',
  timeout: 300000, // 5 minutes for large conversions
});

/**
 * Convert files to PDF
 */
export async function convertFiles(
  files: File[],
  settings: ConversionSettings,
  onProgress?: (percent: number) => void
): Promise<ConversionResponse> {
  const formData = new FormData();

  for (const file of files) {
    formData.append('files', file);
  }

  formData.append('mode', settings.mode);
  formData.append('pageSize', settings.pageSize);
  formData.append('orientation', settings.orientation);
  formData.append('margins', settings.margins);
  formData.append('imageQuality', settings.imageQuality);

  const response = await api.post<ConversionResponse>('/convert', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 50); // first 50% = upload
        onProgress(percent);
      }
    },
  });

  return response.data;
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await api.get('/health', { timeout: 5000 });
    return res.data?.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Get the full download URL for a file
 */
export function getDownloadUrl(filename: string, friendlyName?: string): string {
  const base = `/api/download/${encodeURIComponent(filename)}`;
  return friendlyName ? `${base}?name=${encodeURIComponent(friendlyName.replace('.pdf', ''))}` : base;
}

/**
 * Get the full preview URL for a PDF
 */
export function getPreviewUrl(filename: string): string {
  return `/api/preview/${encodeURIComponent(filename)}`;
}

export default api;
