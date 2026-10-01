const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Page size definitions in points (72 pt = 1 inch)
const PAGE_SIZES = {
  A4:     [595.28, 841.89],
  A3:     [841.89, 1190.55],
  A5:     [419.53, 595.28],
  Letter: [612, 792],
  Legal:  [612, 1008],
};

/**
 * Convert an image file to PDF
 * @param {string} inputPath       - absolute path to image
 * @param {string} outputPath      - absolute path for output PDF
 * @param {object} options         - { pageSize, orientation, margins, imageQuality }
 */
async function convertImageToPDF(inputPath, outputPath, options = {}) {
  const {
    pageSize = 'A4',
    orientation = 'auto',
    margins = 'default',
    imageQuality = 'high',
  } = options;

  // Get image metadata
  const metadata = await sharp(inputPath).metadata();
  const imgWidth = metadata.width || 800;
  const imgHeight = metadata.height || 600;

  // Get page dimensions
  let [pageW, pageH] = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;

  // Determine orientation
  let useOrientation = orientation;
  if (orientation === 'auto' || orientation === 'automatic') {
    useOrientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
  }
  if (useOrientation === 'landscape') {
    [pageW, pageH] = [pageH, pageW];
  }

  // Margin values in points
  const marginMap = { default: 36, narrow: 18, none: 0 };
  const margin = marginMap[margins] ?? 36;

  // Convert image to PNG buffer for embedding (sharp normalizes formats)
  let quality = 90;
  if (imageQuality === 'maximum') quality = 100;
  else if (imageQuality === 'standard') quality = 75;

  const pngBuffer = await sharp(inputPath)
    .png({ quality, compressionLevel: imageQuality === 'maximum' ? 0 : 6 })
    .toBuffer();

  // Build PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([pageW, pageH]);

  const pngImage = await pdfDoc.embedPng(pngBuffer);

  // Scale image to fit within margins, preserving aspect ratio
  const availW = pageW - margin * 2;
  const availH = pageH - margin * 2;
  const scale = Math.min(availW / pngImage.width, availH / pngImage.height, 1);
  const drawW = pngImage.width * scale;
  const drawH = pngImage.height * scale;
  const x = margin + (availW - drawW) / 2;
  const y = margin + (availH - drawH) / 2;

  page.drawImage(pngImage, { x, y, width: drawW, height: drawH });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  return outputPath;
}

/**
 * Convert a plain text file to PDF
 * @param {string} inputPath  - path to .txt file
 * @param {string} outputPath - destination PDF path
 * @param {object} options    - { pageSize, orientation, margins }
 */
async function convertTextToPDF(inputPath, outputPath, options = {}) {
  const { pageSize = 'A4', orientation = 'portrait', margins = 'default' } = options;

  let [pageW, pageH] = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
  if (orientation === 'landscape') [pageW, pageH] = [pageH, pageW];

  const marginMap = { default: 50, narrow: 25, none: 10 };
  const margin = marginMap[margins] ?? 50;

  const text = fs.readFileSync(inputPath, 'utf-8');
  const lines = text.split('\n');

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Courier);
  const fontSize = 11;
  const lineHeight = fontSize * 1.4;

  const usableW = pageW - margin * 2;
  const usableH = pageH - margin * 2;
  const linesPerPage = Math.floor(usableH / lineHeight);
  const charsPerLine = Math.floor(usableW / (fontSize * 0.6)); // approximate for monospace

  // Word-wrap long lines
  const wrappedLines = [];
  for (const line of lines) {
    if (line.length === 0) {
      wrappedLines.push('');
      continue;
    }
    let remaining = line;
    while (remaining.length > charsPerLine) {
      // Try to break at space
      let breakAt = remaining.lastIndexOf(' ', charsPerLine);
      if (breakAt <= 0) breakAt = charsPerLine;
      wrappedLines.push(remaining.slice(0, breakAt));
      remaining = remaining.slice(breakAt).trimStart();
    }
    wrappedLines.push(remaining);
  }

  // Paginate
  let lineIdx = 0;
  while (lineIdx < wrappedLines.length) {
    const page = pdfDoc.addPage([pageW, pageH]);
    let y = pageH - margin - fontSize;

    for (let i = 0; i < linesPerPage && lineIdx < wrappedLines.length; i++, lineIdx++) {
      const line = wrappedLines[lineIdx];
      if (line) {
        page.drawText(line, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      }
      y -= lineHeight;
    }
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  return outputPath;
}

/**
 * Convert CSV to a simple text-based PDF
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {object} options
 */
async function convertCSVToPDF(inputPath, outputPath, options = {}) {
  const { parse } = require('csv-parse/sync');
  const { pageSize = 'A4', orientation = 'landscape', margins = 'narrow' } = options;

  let [pageW, pageH] = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
  if (orientation === 'landscape' || orientation === 'automatic' || orientation === 'auto') {
    [pageW, pageH] = [pageH, pageW];
  }

  const marginMap = { default: 36, narrow: 20, none: 8 };
  const margin = marginMap[margins] ?? 20;

  const csvContent = fs.readFileSync(inputPath, 'utf-8');
  let records;
  try {
    records = parse(csvContent, { skip_empty_lines: true, relax_column_count: true });
  } catch {
    records = csvContent.split('\n').map(l => [l]);
  }

  if (!records || records.length === 0) {
    records = [['(Empty CSV file)']];
  }

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Courier);
  const boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
  const fontSize = 9;
  const lineHeight = fontSize * 1.5;
  const colPadding = 8;

  const headers = records[0];
  const dataRows = records.slice(1);

  const usableW = pageW - margin * 2;
  const colCount = headers.length;
  const colWidth = Math.min(Math.floor(usableW / colCount), 150);

  const rowsPerPage = Math.floor((pageH - margin * 2 - lineHeight) / lineHeight);

  function drawPage(rowSlice, isFirstPage) {
    const page = pdfDoc.addPage([pageW, pageH]);
    let y = pageH - margin;

    // Draw headers
    if (isFirstPage) {
      headers.forEach((h, i) => {
        const x = margin + i * colWidth;
        page.drawRectangle({
          x, y: y - lineHeight, width: colWidth, height: lineHeight,
          color: rgb(0.22, 0.38, 0.73),
        });
        page.drawText(String(h).slice(0, Math.floor(colWidth / 6)), {
          x: x + colPadding,
          y: y - lineHeight + (lineHeight - fontSize) / 2,
          size: fontSize,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
      });
      y -= lineHeight;
    }

    // Draw rows
    rowSlice.forEach((row, ri) => {
      const bg = ri % 2 === 0 ? rgb(0.97, 0.97, 0.97) : rgb(1, 1, 1);
      page.drawRectangle({
        x: margin, y: y - lineHeight, width: usableW, height: lineHeight,
        color: bg,
      });
      headers.forEach((_, ci) => {
        const cellVal = row[ci] != null ? String(row[ci]) : '';
        page.drawText(cellVal.slice(0, Math.floor(colWidth / 6)), {
          x: margin + ci * colWidth + colPadding,
          y: y - lineHeight + (lineHeight - fontSize) / 2,
          size: fontSize,
          font,
          color: rgb(0.1, 0.1, 0.1),
        });
      });
      y -= lineHeight;
    });
  }

  // Paginate
  drawPage(dataRows.slice(0, rowsPerPage), true);
  let offset = rowsPerPage;
  while (offset < dataRows.length) {
    drawPage(dataRows.slice(offset, offset + rowsPerPage), false);
    offset += rowsPerPage;
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  return outputPath;
}

module.exports = { convertImageToPDF, convertTextToPDF, convertCSVToPDF };
