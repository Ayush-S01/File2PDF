import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PDFPreviewProps {
  url: string;
  filename?: string;
}

export default function PDFPreview({ url, filename }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    setError(`Failed to load PDF preview: ${err.message}`);
    setLoading(false);
  }, []);

  const prevPage = () => setPageNumber(p => Math.max(1, p - 1));
  const nextPage = () => setPageNumber(p => Math.min(numPages, p + 1));
  const zoomIn  = () => setScale(s => Math.min(3, +(s + 0.25).toFixed(2)));
  const zoomOut = () => setScale(s => Math.max(0.5, +(s - 0.25).toFixed(2)));

  const openFullscreen = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }} role="alert">
        <p>{error}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
          Open PDF in new tab
        </a>
      </div>
    );
  }

  return (
    <div className="pdf-preview-container" aria-label={`PDF Preview${filename ? ': ' + filename : ''}`}>
      {/* Toolbar */}
      <div className="pdf-preview-toolbar" role="toolbar" aria-label="PDF preview controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={prevPage} disabled={pageNumber <= 1} aria-label="Previous page" title="Previous page">
            <ChevronLeft size={14} aria-hidden="true" />
          </button>
          <span style={{ color: 'white', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            {loading ? '...' : `${pageNumber} / ${numPages}`}
          </span>
          <button onClick={nextPage} disabled={pageNumber >= numPages} aria-label="Next page" title="Next page">
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={zoomOut} disabled={scale <= 0.5} aria-label="Zoom out" title="Zoom out">
            <ZoomOut size={14} aria-hidden="true" />
          </button>
          <span style={{ color: 'white', fontSize: '0.8rem', minWidth: 44, textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button onClick={zoomIn} disabled={scale >= 3} aria-label="Zoom in" title="Zoom in">
            <ZoomIn size={14} aria-hidden="true" />
          </button>
          <button onClick={openFullscreen} aria-label="Open in new tab (full screen)" title="Open in new tab">
            <Maximize2 size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* PDF Page */}
      <div className="pdf-preview-page">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div style={{ padding: 40, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }} aria-hidden="true" />
              Loading preview...
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={false}
            loading={null}
          />
        </Document>
      </div>
    </div>
  );
}
