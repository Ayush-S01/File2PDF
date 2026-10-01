import { Info, Github, FileText } from 'lucide-react';

export default function About() {
  return (
    <main id="main" className="section" tabIndex={-1}>
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Hero banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-50), var(--primary-100))',
          borderRadius: 'var(--radius-xl)',
          padding: '48px 40px',
          marginBottom: 40,
          textAlign: 'center',
          border: '1px solid var(--primary-100)',
        }}>
          <div style={{
            width: 72, height: 72,
            background: 'var(--primary)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <FileText size={36} color="white" aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: 12, letterSpacing: -0.5 }}>About File2PDF</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
            File2PDF is a simple file conversion tool designed to make PDF creation quick and convenient.
            Upload a supported file, convert it, preview the result, and download your PDF.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {[
            {
              icon: '🚀',
              title: 'Fast Conversion',
              desc: 'Files are processed server-side using reliable libraries including LibreOffice for documents and optimized image processors.',
            },
            {
              icon: '🔒',
              title: 'Privacy First',
              desc: 'Uploaded files are stored temporarily and deleted automatically after processing. Your files are not permanently stored.',
            },
            {
              icon: '📱',
              title: 'Works Everywhere',
              desc: 'Fully responsive design works on desktop, tablet, and mobile. Dark mode available for comfortable use in any environment.',
            },
            {
              icon: '🛠️',
              title: 'Real Conversion',
              desc: 'Files are genuinely converted — documents via LibreOffice headless, images via optimized pipelines. No fake extension renaming.',
            },
          ].map(item => (
            <div key={item.title} className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }} aria-hidden="true">{item.icon}</div>
              <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="card" style={{ padding: 28, marginTop: 24 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={18} aria-hidden="true" />
            Technology
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['Frontend', 'React + TypeScript, Vite, dnd-kit'],
              ['Backend',  'Node.js, Express.js'],
              ['Documents','LibreOffice Headless'],
              ['Images',   'Sharp (libvips)'],
              ['PDFs',     'pdf-lib, pdf-merger-js'],
              ['Preview',  'react-pdf (PDF.js)'],
            ].map(([label, value]) => (
              <div key={label} style={{ fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>{label}</span>
                <span style={{ color: 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Limitations */}
        <div className="card" style={{ padding: 28, marginTop: 24, borderColor: 'var(--warning)', background: 'var(--warning-light)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>⚠️ Known Requirements</h2>
          <ul style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 20 }}>
            <li>LibreOffice must be installed on the server for DOC/DOCX/PPT/PPTX/XLS/XLSX/ODT/ODP/ODS/RTF conversion.</li>
            <li>Without LibreOffice, only images, TXT, CSV and PDF pass-through will work.</li>
            <li>Maximum file size is 50 MB per file and up to 20 files per conversion.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
