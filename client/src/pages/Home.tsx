import { useState, useRef, useCallback } from 'react';
import { FileText, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import Hero from '../components/Hero';
import UploadZone from '../components/UploadZone';
import FileList from '../components/FileList';
import ConversionSettingsPanel from '../components/ConversionSettings';
import Progress from '../components/Progress';
import PDFResult from '../components/PDFResult';
import { convertFiles } from '../services/api';
import type {
  UploadedFile,
  ConversionSettings,
  ConversionResult,
  FileConversionStatus,
  AppStep,
} from '../types/file';

interface HomeProps {
  defaultSettings: ConversionSettings;
}

export default function Home({ defaultSettings }: HomeProps) {
  const [step, setStep] = useState<AppStep>('upload');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>(defaultSettings);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [statuses, setStatuses] = useState<FileConversionStatus[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const uploadRef = useRef<HTMLDivElement>(null);

  const handleFilesAdded = useCallback((newFiles: UploadedFile[]) => {
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size));
      const deduped = newFiles.filter(f => !existing.has(f.name + f.size));
      return [...prev, ...deduped];
    });
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleReorder = useCallback((reordered: UploadedFile[]) => {
    setFiles(reordered);
  }, []);

  const handleSettingsChange = useCallback((updates: Partial<ConversionSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const handleStartConvert = async () => {
    if (files.length === 0) return;

    setStep('converting');
    setProgress(10);
    setGlobalError(null);

    // Mark all files as converting
    setFiles(prev => prev.map(f => ({ ...f, status: 'converting' })));

    try {
      setCurrentFile('Uploading files...');
      setProgress(20);

      const response = await convertFiles(
        files.map(f => f.file),
        settings,
        (uploadPercent) => {
          setProgress(20 + Math.round(uploadPercent * 0.4)); // 20–60%
        }
      );

      setProgress(70);
      setCurrentFile('Processing conversions...');

      // Update file statuses based on response
      if (response.conversions) {
        setFiles(prev => prev.map(f => {
          const conv = response.conversions.find(c => c.originalName === f.name);
          if (!conv) return f;
          return {
            ...f,
            status: conv.status === 'success' ? 'done' : 'error',
            error: conv.error,
          };
        }));
        setStatuses(response.conversions);
      }

      setProgress(100);
      setResults(response.result || []);
      setCurrentFile('');

      setTimeout(() => {
        setStep('result');
      }, 500);

    } catch (err: unknown) {
      const message = err instanceof Error
        ? err.message
        : 'Something went wrong. Please try again.';

      // Try to parse axios error response
      let errorMsg = message;
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        if (axiosErr.response?.data?.error) {
          errorMsg = axiosErr.response.data.error;
        }
      }

      setGlobalError(errorMsg);
      setFiles(prev => prev.map(f => ({ ...f, status: f.status === 'converting' ? 'ready' : f.status })));
      setStep('error');
    }
  };

  const handleStartNew = () => {
    setFiles([]);
    setResults([]);
    setStatuses([]);
    setGlobalError(null);
    setProgress(0);
    setCurrentFile('');
    setStep('upload');
    setTimeout(() => uploadRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Hero onStart={scrollToUpload} />

      <main id="main" className="section" tabIndex={-1}>
        <div className="container" style={{ maxWidth: 800 }}>

          {/* ── Upload step ── */}
          {step === 'upload' && (
            <>
              <div ref={uploadRef}>
                {files.length === 0 ? (
                  <UploadZone onFilesAdded={handleFilesAdded} />
                ) : (
                  <FileList
                    files={files}
                    onFilesAdded={handleFilesAdded}
                    onRemove={handleRemoveFile}
                    onReorder={handleReorder}
                    showDragHandles={settings.mode === 'merge' && files.length > 1}
                  />
                )}
              </div>

              {files.length > 0 && (
                <>
                  <ConversionSettingsPanel
                    settings={settings}
                    onChange={handleSettingsChange}
                    fileCount={files.length}
                  />

                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleStartConvert}
                    aria-label={`Convert ${files.length} file${files.length !== 1 ? 's' : ''} to PDF`}
                    type="button"
                  >
                    <FileText size={20} aria-hidden="true" />
                    Convert to PDF
                  </button>
                </>
              )}
            </>
          )}

          {/* ── Converting step ── */}
          {step === 'converting' && (
            <Progress files={files} progress={progress} currentFile={currentFile} />
          )}

          {/* ── Result step ── */}
          {step === 'result' && results.length > 0 && (
            <PDFResult
              results={results}
              statuses={statuses}
              onStartNew={handleStartNew}
            />
          )}

          {/* ── Error step ── */}
          {step === 'error' && (
            <div className="result-container" role="alert" aria-live="assertive">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: 72, height: 72,
                  background: 'var(--error-light)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <AlertTriangle size={32} color="var(--error)" aria-hidden="true" />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Conversion Failed</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
                  {globalError || 'We couldn\'t convert your files. Please check the files and try again.'}
                </p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => setStep('upload')}
                    type="button"
                  >
                    <RefreshCw size={16} aria-hidden="true" />
                    Try Again
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleStartNew}
                    type="button"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* How It Works */}
      <section id="how" className="how-it-works" aria-labelledby="how-heading">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h2 id="how-heading" className="section-title">How It Works</h2>
            <p className="section-subtitle">Three simple steps to your PDF</p>
          </div>

          <div className="how-steps">
            {[
              { emoji: '📂', step: '1', title: 'Upload', desc: 'Choose or drag your files into the upload area. Supports documents, images, presentations, spreadsheets and more.' },
              { emoji: '⚙️', step: '2', title: 'Convert', desc: 'The application automatically detects the file type and converts it into a high-quality PDF.' },
              { emoji: '⬇️', step: '3', title: 'Download', desc: 'Preview the generated PDF, rename it if you wish, and download it with one click.' },
            ].map(item => (
              <div key={item.step} className="how-step">
                <div className="how-step-number" aria-label={`Step ${item.step}`}>
                  {item.emoji}
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section id="formats" className="formats-section" aria-labelledby="formats-heading">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h2 id="formats-heading" className="section-title">Supported Formats</h2>
            <p className="section-subtitle">Convert from a wide range of file types</p>
          </div>

          <div className="formats-grid">
            {[
              { icon: '📄', title: 'Documents', tags: ['DOC', 'DOCX', 'TXT', 'RTF', 'ODT'] },
              { icon: '📊', title: 'Presentations', tags: ['PPT', 'PPTX', 'ODP'] },
              { icon: '📈', title: 'Spreadsheets', tags: ['XLS', 'XLSX', 'ODS', 'CSV'] },
              { icon: '🖼️', title: 'Images', tags: ['JPG', 'PNG', 'WEBP', 'BMP', 'TIFF'] },
              { icon: '🌐', title: 'Web', tags: ['HTML', 'HTM'] },
              { icon: '📕', title: 'PDF', tags: ['PDF'] },
            ].map(format => (
              <div key={format.title} className="format-card">
                <div className="format-card-icon" aria-hidden="true">{format.icon}</div>
                <h3>{format.title}</h3>
                <div className="format-tags" role="list" aria-label={`${format.title} formats`}>
                  {format.tags.map(tag => (
                    <span key={tag} className="format-tag" role="listitem">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
