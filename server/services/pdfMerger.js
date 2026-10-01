const PDFMerger = require('pdf-merger-js');
const fs = require('fs');

/**
 * Merge multiple PDF files into one
 * @param {string[]} pdfPaths  - array of absolute PDF paths in desired order
 * @param {string} outputPath  - absolute path for the merged PDF
 * @returns {Promise<string>}  - outputPath
 */
async function mergePDFs(pdfPaths, outputPath) {
  if (!pdfPaths || pdfPaths.length === 0) {
    throw new Error('No PDF files provided for merging.');
  }

  // Validate all files exist
  for (const p of pdfPaths) {
    if (!fs.existsSync(p)) {
      throw new Error(`PDF file not found: ${p}`);
    }
  }

  if (pdfPaths.length === 1) {
    // No actual merging needed — just copy
    fs.copyFileSync(pdfPaths[0], outputPath);
    return outputPath;
  }

  const merger = new PDFMerger();
  for (const p of pdfPaths) {
    await merger.add(p);
  }
  await merger.save(outputPath);
  return outputPath;
}

module.exports = { mergePDFs };
