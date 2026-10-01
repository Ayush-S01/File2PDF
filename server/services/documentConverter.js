const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

/**
 * Detect LibreOffice executable path across platforms
 */
function getLibreOfficePath() {
  if (process.platform === 'win32') {
    const candidates = [
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    return 'soffice'; // Fallback: hope it's in PATH
  }
  if (process.platform === 'darwin') {
    return '/Applications/LibreOffice.app/Contents/MacOS/soffice';
  }
  return 'soffice'; // Linux
}

const SOFFICE = getLibreOfficePath();

/**
 * Convert a document/presentation/spreadsheet to PDF using LibreOffice headless.
 * @param {string} inputPath  - absolute path to source file
 * @param {string} outputDir  - directory where the PDF should be placed
 * @returns {Promise<string>} - absolute path to generated PDF
 */
async function convertWithLibreOffice(inputPath, outputDir) {
  const args = [
    '--headless',
    '--norestore',
    '--nologo',
    '--nofirststartwizard',
    '--convert-to', 'pdf',
    '--outdir', outputDir,
    inputPath,
  ];

  try {
    await execFileAsync(SOFFICE, args, {
      timeout: 120000, // 2 minutes
      env: {
        ...process.env,
        HOME: outputDir, // Prevent LibreOffice from trying to write to system HOME
      },
    });
  } catch (err) {
    // LibreOffice sometimes exits with non-zero but still produces a file
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const expectedOutput = path.join(outputDir, `${baseName}.pdf`);
    if (!fs.existsSync(expectedOutput)) {
      throw new Error(`LibreOffice conversion failed: ${err.message}`);
    }
  }

  // Find the generated PDF
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}.pdf`);
  if (!fs.existsSync(outputPath)) {
    throw new Error('LibreOffice did not produce a PDF output file.');
  }
  return outputPath;
}

/**
 * Check if LibreOffice is available
 */
async function isLibreOfficeAvailable() {
  try {
    await execFileAsync(SOFFICE, ['--version'], { timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

module.exports = { convertWithLibreOffice, isLibreOfficeAvailable, getLibreOfficePath };
