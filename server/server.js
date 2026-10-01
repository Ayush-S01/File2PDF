require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const conversionRoutes = require('./routes/conversionRoutes');
const { cleanupOldFiles } = require('./utils/cleanup');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure upload and output directories exist
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
const outputDir = path.join(__dirname, process.env.OUTPUT_DIR || 'output');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for conversion endpoint
const conversionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window per IP
  message: {
    error: 'Too many requests. Please wait a few minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api', conversionLimiter, conversionRoutes);

// Health check (no rate limit)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Serve output files for download
app.use('/api/files', express.static(outputDir, {
  setHeaders: (res) => {
    res.setHeader('Content-Disposition', 'attachment');
  },
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  res.status(err.status || 500).json({
    error: err.message || 'An internal server error occurred. Please try again.',
  });
});

// Start cleanup interval — remove files older than FILE_CLEANUP_DELAY ms
const cleanupInterval = parseInt(process.env.FILE_CLEANUP_DELAY || '300000');
setInterval(() => cleanupOldFiles(uploadDir, cleanupInterval), cleanupInterval);
setInterval(() => cleanupOldFiles(outputDir, cleanupInterval), cleanupInterval);

app.listen(PORT, () => {
  console.log(`✅ File2PDF server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Upload dir:  ${uploadDir}`);
  console.log(`   Output dir:  ${outputDir}`);
});

module.exports = app;
