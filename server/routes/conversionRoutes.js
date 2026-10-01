const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  upload,
  handleConvert,
  handleDownload,
  handlePreview,
  handleHealth,
} = require('../controllers/conversionController');

// Health check
router.get('/health', handleHealth);

// Convert files to PDF
router.post(
  '/convert',
  (req, res, next) => {
    upload.array('files', 20)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: `File is too large. Maximum allowed size is ${Math.round(parseInt(process.env.MAX_FILE_SIZE || '52428800') / 1024 / 1024)} MB.`,
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ error: err.field || 'Unsupported file type.' });
        }
        return res.status(400).json({ error: err.message });
      }
      if (err) {
        return res.status(500).json({ error: 'Upload failed. Please try again.' });
      }
      next();
    });
  },
  handleConvert
);

// Download a converted PDF
router.get('/download/:filename', handleDownload);

// Preview a converted PDF inline
router.get('/preview/:filename', handlePreview);

module.exports = router;
