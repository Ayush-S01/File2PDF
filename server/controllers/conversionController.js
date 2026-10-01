const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sanitize = require('sanitize-filename');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
const outputDir = path.join(__dirname, '..', process.env.OUTPUT_DIR || 'output');
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '52428800');

const { validateFile } = require('../services/fileValidator');
const { convertWithLibreOffice } = require('../services/documentConverter');
const { convertImageToPDF, convertTextToPDF, convertCSVToPDF } = require('../services/imageConverter');
const { mergePDFs } = require('../services/pdfMerger');
const { safeDeleteAll, safeDelete } = require('../utils/cleanup');

// ── Multer configuration ──────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeOriginal = sanitize(path.basename(file.originalname, ext)).replace(/\s+/g, '_') || 'file';
    const uniqueName = `${uuidv4()}_${safeOriginal}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 20 },
  fileFilter: (req, file, cb) => {
    const result = validateFile(file);
    if (!result.valid) {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', result.error));
    }
    cb(null, true);
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Send structured progress event via SSE (if res supports it)
 */
function sendProgress(res, data) {
  if (res.headersSent && res.write) {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch { /* ignore */ }
  }
}

/**
 * Generate a safe output filename from original
 */
function makeOutputName(original, prefix = '') {
  const ext = path.extname(original);
  const base = sanitize(path.basename(original, ext)).replace(/\s+/g, '_') || 'file';
  return `${prefix}${base}.pdf`;
}

/**
 * Convert a single uploaded file to PDF.
 * Returns the path of the generated PDF.
 */
async function convertFile(file, options, tmpDir) {
  const { mimeType, typeInfo } = validateFile(file);

  const baseName = path.basename(file.path, path.extname(file.path));
  const pdfOutputPath = path.join(tmpDir, `${baseName}.pdf`);

  switch (typeInfo.converter) {
    case 'libreoffice':
      await convertWithLibreOffice(file.path, tmpDir);
      // LibreOffice names output after input base name
      return path.join(tmpDir, `${path.basename(file.path, path.extname(file.path))}.pdf`);

    case 'image':
      await convertImageToPDF(file.path, pdfOutputPath, options);
      return pdfOutputPath;

    case 'text':
      await convertTextToPDF(file.path, pdfOutputPath, options);
      return pdfOutputPath;

    case 'csv':
      await convertCSVToPDF(file.path, pdfOutputPath, options);
      return pdfOutputPath;

    case 'html':
      // Fall back to LibreOffice for HTML if available, otherwise text
      try {
        await convertWithLibreOffice(file.path, tmpDir);
        return path.join(tmpDir, `${path.basename(file.path, path.extname(file.path))}.pdf`);
      } catch {
        // Fallback: treat as text
        await convertTextToPDF(file.path, pdfOutputPath, options);
        return pdfOutputPath;
      }

    case 'passthrough':
      // Already a PDF — copy to output
      fs.copyFileSync(file.path, pdfOutputPath);
      return pdfOutputPath;

    default:
      throw new Error(`No converter found for type: ${typeInfo.converter}`);
  }
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/convert
 * Accepts: multipart/form-data with `files`, `mode`, `pageSize`, `orientation`, `margins`, `imageQuality`
 */
async function handleConvert(req, res) {
  const uploadedFiles = req.files || [];
  const tempFilePaths = uploadedFiles.map(f => f.path);
  const generatedPDFs = [];

  try {
    if (!uploadedFiles.length) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const options = {
      pageSize:     req.body.pageSize     || 'A4',
      orientation:  req.body.orientation  || 'auto',
      margins:      req.body.margins      || 'default',
      imageQuality: req.body.imageQuality || 'high',
    };
    const mode = req.body.mode || 'separate'; // 'separate' | 'merge'

    // Validate all files
    for (const file of uploadedFiles) {
      const result = validateFile(file);
      if (!result.valid) {
        safeDeleteAll(tempFilePaths);
        return res.status(400).json({ error: result.error, filename: file.originalname });
      }
    }

    // Convert each file
    const conversions = [];
    for (const file of uploadedFiles) {
      try {
        const pdfPath = await convertFile(file, options, outputDir);
        generatedPDFs.push(pdfPath);
        conversions.push({
          originalName: file.originalname,
          status: 'success',
          pdfName: path.basename(pdfPath),
        });
      } catch (err) {
        conversions.push({
          originalName: file.originalname,
          status: 'failed',
          error: err.message,
        });
      }
    }

    const successPDFs = generatedPDFs;

    if (successPDFs.length === 0) {
      safeDeleteAll(tempFilePaths);
      return res.status(422).json({
        error: 'All conversions failed. Please check your files and try again.',
        conversions,
      });
    }

    if (mode === 'merge' && successPDFs.length > 1) {
      // Merge all PDFs into one
      const mergedName = `Combined_Document_${uuidv4().slice(0, 8)}.pdf`;
      const mergedPath = path.join(outputDir, mergedName);
      await mergePDFs(successPDFs, mergedPath);

      // Remove individual PDFs that were merged
      safeDeleteAll(successPDFs);
      safeDeleteAll(tempFilePaths);

      return res.json({
        mode: 'merge',
        conversions,
        result: [{
          filename: mergedName,
          originalName: 'Combined_Document.pdf',
          downloadUrl: `/api/download/${mergedName}`,
        }],
      });
    } else {
      // Separate mode or only 1 file
      safeDeleteAll(tempFilePaths);

      const results = successPDFs.map((pdfPath, idx) => {
        const filename = path.basename(pdfPath);
        const original = uploadedFiles[idx]?.originalname || filename;
        return {
          filename,
          originalName: makeOutputName(original),
          downloadUrl: `/api/download/${filename}`,
        };
      });

      return res.json({
        mode: 'separate',
        conversions,
        result: results,
      });
    }
  } catch (err) {
    safeDeleteAll(tempFilePaths);
    safeDeleteAll(generatedPDFs);
    console.error('[Convert]', err.message);
    return res.status(500).json({
      error: 'Something went wrong during conversion. Please try again.',
    });
  }
}

/**
 * GET /api/download/:filename
 * Streams the PDF file to the client
 */
async function handleDownload(req, res) {
  // Sanitize to prevent path traversal
  const filename = path.basename(req.params.filename);
  const filePath = path.join(outputDir, filename);

  if (!filePath.startsWith(outputDir)) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found or has expired. Please convert again.' });
  }

  const downloadName = req.query.name
    ? sanitize(req.query.name) + '.pdf'
    : filename;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
  res.setHeader('Content-Length', fs.statSync(filePath).size);

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
  stream.on('error', () => {
    if (!res.headersSent) res.status(500).json({ error: 'Download failed.' });
  });
}

/**
 * GET /api/preview/:filename
 * Streams the PDF inline for preview
 */
async function handlePreview(req, res) {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(outputDir, filename);

  if (!filePath.startsWith(outputDir)) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found or has expired.' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.setHeader('Content-Length', fs.statSync(filePath).size);

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
  stream.on('error', () => {
    if (!res.headersSent) res.status(500).json({ error: 'Preview failed.' });
  });
}

/**
 * GET /api/health
 */
function handleHealth(req, res) {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
}

module.exports = {
  upload,
  handleConvert,
  handleDownload,
  handlePreview,
  handleHealth,
};
