const fs = require('fs');
const path = require('path');

/**
 * Delete files older than maxAgeMs from directory
 * @param {string} dir       - directory to clean
 * @param {number} maxAgeMs  - maximum age in milliseconds
 */
function cleanupOldFiles(dir, maxAgeMs = 300000) {
  if (!fs.existsSync(dir)) return;

  try {
    const files = fs.readdirSync(dir);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat.isFile() && now - stat.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath);
        }
      } catch {
        // File may have been deleted already — ignore
      }
    }
  } catch (err) {
    console.error(`[Cleanup] Error cleaning directory ${dir}:`, err.message);
  }
}

/**
 * Safely delete a single file (no-throw)
 * @param {string} filePath
 */
function safeDelete(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignore
  }
}

/**
 * Safely delete an array of files (no-throw)
 * @param {string[]} filePaths
 */
function safeDeleteAll(filePaths) {
  for (const p of filePaths) safeDelete(p);
}

module.exports = { cleanupOldFiles, safeDelete, safeDeleteAll };
