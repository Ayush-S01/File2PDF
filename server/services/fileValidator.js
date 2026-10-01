const SUPPORTED_TYPES = {
  // Documents
  'application/msword': { ext: 'doc', category: 'document', converter: 'libreoffice' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', category: 'document', converter: 'libreoffice' },
  'text/plain': { ext: 'txt', category: 'text', converter: 'text' },
  'application/rtf': { ext: 'rtf', category: 'document', converter: 'libreoffice' },
  'text/rtf': { ext: 'rtf', category: 'document', converter: 'libreoffice' },
  'application/vnd.oasis.opendocument.text': { ext: 'odt', category: 'document', converter: 'libreoffice' },

  // Presentations
  'application/vnd.ms-powerpoint': { ext: 'ppt', category: 'presentation', converter: 'libreoffice' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: 'pptx', category: 'presentation', converter: 'libreoffice' },
  'application/vnd.oasis.opendocument.presentation': { ext: 'odp', category: 'presentation', converter: 'libreoffice' },

  // Spreadsheets
  'application/vnd.ms-excel': { ext: 'xls', category: 'spreadsheet', converter: 'libreoffice' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: 'xlsx', category: 'spreadsheet', converter: 'libreoffice' },
  'application/vnd.oasis.opendocument.spreadsheet': { ext: 'ods', category: 'spreadsheet', converter: 'libreoffice' },
  'text/csv': { ext: 'csv', category: 'spreadsheet', converter: 'csv' },
  'application/csv': { ext: 'csv', category: 'spreadsheet', converter: 'csv' },

  // Images
  'image/jpeg': { ext: 'jpg', category: 'image', converter: 'image' },
  'image/png': { ext: 'png', category: 'image', converter: 'image' },
  'image/webp': { ext: 'webp', category: 'image', converter: 'image' },
  'image/bmp': { ext: 'bmp', category: 'image', converter: 'image' },
  'image/tiff': { ext: 'tiff', category: 'image', converter: 'image' },

  // Web
  'text/html': { ext: 'html', category: 'web', converter: 'html' },

  // PDF (pass-through)
  'application/pdf': { ext: 'pdf', category: 'pdf', converter: 'passthrough' },
};

// Extension-based fallback (some clients send wrong MIME types)
const EXTENSION_MAP = {
  '.doc':  'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt':  'text/plain',
  '.rtf':  'application/rtf',
  '.odt':  'application/vnd.oasis.opendocument.text',
  '.ppt':  'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.odp':  'application/vnd.oasis.opendocument.presentation',
  '.xls':  'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ods':  'application/vnd.oasis.opendocument.spreadsheet',
  '.csv':  'text/csv',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.bmp':  'image/bmp',
  '.tiff': 'image/tiff',
  '.tif':  'image/tiff',
  '.html': 'text/html',
  '.htm':  'text/html',
  '.pdf':  'application/pdf',
};

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '52428800'); // 50MB

/**
 * Validate uploaded file: size, MIME type, extension
 * Returns { valid, mimeType, typeInfo, error }
 */
function validateFile(file) {
  const path = require('path');

  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // Size check
  if (file.size > MAX_FILE_SIZE) {
    const maxMB = Math.round(MAX_FILE_SIZE / 1024 / 1024);
    return { valid: false, error: `File is too large. Maximum allowed size is ${maxMB} MB.` };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty and cannot be converted.' };
  }

  const ext = path.extname(file.originalname || '').toLowerCase();
  let mimeType = file.mimetype;

  // If browser sends generic MIME, use extension-based lookup
  if (
    !SUPPORTED_TYPES[mimeType] &&
    EXTENSION_MAP[ext]
  ) {
    mimeType = EXTENSION_MAP[ext];
  }

  const typeInfo = SUPPORTED_TYPES[mimeType];
  if (!typeInfo) {
    return {
      valid: false,
      error: `Unsupported file format "${ext || mimeType}". Please upload a supported file type.`,
    };
  }

  return { valid: true, mimeType, typeInfo };
}

module.exports = { validateFile, SUPPORTED_TYPES, EXTENSION_MAP, MAX_FILE_SIZE };
