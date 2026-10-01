# File2PDF

> **Convert. Preview. Download.**

A polished, production-grade File-to-PDF converter built with React + TypeScript frontend and Node.js + Express backend. Converts documents, presentations, spreadsheets, images, and web pages to PDF — with real conversion, not just extension renaming.

---

## Features

- 📄 **Real Conversion** — Uses LibreOffice headless for documents/presentations/spreadsheets, Sharp for images, pdf-lib for text/CSV
- 🖼️ **PDF Preview** — View generated PDFs inline with page navigation and zoom
- 🗂️ **Multiple Files** — Upload up to 20 files at once
- 🔀 **Merge Mode** — Combine all files into a single PDF with drag-and-drop ordering
- ✏️ **Rename Output** — Edit the PDF filename before downloading
- 🌙 **Dark Mode** — Light/Dark/System theme support
- 📱 **Responsive** — Works on desktop, tablet, and mobile
- 🔒 **Secure** — Files are processed and automatically deleted; no permanent storage

---

## Supported File Formats

| Category      | Formats |
|---------------|---------|
| Documents     | DOC, DOCX, TXT, RTF, ODT |
| Presentations | PPT, PPTX, ODP |
| Spreadsheets  | XLS, XLSX, ODS, CSV |
| Images        | JPG, JPEG, PNG, WEBP, BMP, TIFF |
| Web           | HTML, HTM |
| PDF           | PDF (pass-through / merge) |

---

## Requirements

### System Dependencies

> **LibreOffice** is required for document, presentation, and spreadsheet conversion.

**Windows:**
1. Download from https://www.libreoffice.org/download/libreoffice-fresh/
2. Install to `C:\Program Files\LibreOffice\`
3. The server auto-detects the installation path

**macOS:**
```bash
brew install --cask libreoffice
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install -y libreoffice
```

### Node.js
- Node.js v18+ required
- npm v9+

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Ayush-S01/File2PDF.git
cd File2PDF
```

### 2. Install all dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

Or use the shortcut (if concurrently is installed at root):
```bash
npm run install:all
```

### 3. Configure environment

The server ships with a default `.env`. To customize, copy `.env.example`:

```bash
cp server/.env.example server/.env
```

Edit as needed:
```env
PORT=3001
NODE_ENV=development
MAX_FILE_SIZE=52428800      # 50 MB
FILE_CLEANUP_DELAY=300000   # 5 minutes
CORS_ORIGIN=http://localhost:5173
```

---

## Running in Development

Start both frontend and backend simultaneously:

```bash
npm run dev
```

This runs:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

Or start them separately:

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

---

## Building for Production

```bash
# Build the frontend
cd client && npm run build

# Start the backend (serves the API)
cd server && npm start
```

To serve the frontend from the backend in production, copy the `client/dist` folder and serve it as static files from Express (or use a CDN/Nginx).

---

## API Documentation

### Health Check
```
GET /api/health
```
Response: `{ "status": "ok", "timestamp": "...", "version": "1.0.0" }`

---

### Convert Files
```
POST /api/convert
Content-Type: multipart/form-data
```

**Parameters:**

| Field        | Type   | Description |
|-------------|--------|-------------|
| `files`      | File[] | One or more files to convert |
| `mode`       | string | `separate` or `merge` |
| `pageSize`   | string | `A4`, `A3`, `A5`, `Letter`, `Legal` |
| `orientation`| string | `auto`, `portrait`, `landscape` |
| `margins`    | string | `default`, `narrow`, `none` |
| `imageQuality`| string | `standard`, `high`, `maximum` |

**Response (200):**
```json
{
  "mode": "separate",
  "conversions": [
    { "originalName": "report.docx", "status": "success", "pdfName": "report.pdf" }
  ],
  "result": [
    {
      "filename": "uuid_report.pdf",
      "originalName": "report.pdf",
      "downloadUrl": "/api/download/uuid_report.pdf"
    }
  ]
}
```

---

### Download PDF
```
GET /api/download/:filename
GET /api/download/:filename?name=custom_name
```
Streams the PDF file as an attachment.

---

### Preview PDF
```
GET /api/preview/:filename
```
Streams the PDF inline (for browser preview).

---

## Project Structure

```
File2PDF/
├── client/                    # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx        # Sticky nav with hamburger
│   │   │   ├── Hero.tsx          # Landing hero section
│   │   │   ├── UploadZone.tsx    # Drag & drop upload
│   │   │   ├── FileList.tsx      # Sortable file list
│   │   │   ├── FileItem.tsx      # Individual file card
│   │   │   ├── ConversionSettings.tsx
│   │   │   ├── Progress.tsx      # Conversion progress
│   │   │   ├── PDFPreview.tsx    # Inline PDF viewer
│   │   │   ├── PDFResult.tsx     # Result + download screen
│   │   │   └── Footer.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Main conversion page
│   │   │   ├── About.tsx
│   │   │   └── Settings.tsx
│   │   ├── services/
│   │   │   └── api.ts            # Axios API client
│   │   ├── types/
│   │   │   └── file.ts           # TypeScript types
│   │   ├── utils/
│   │   │   └── fileUtils.ts      # File validation helpers
│   │   ├── hooks/
│   │   │   └── useSettings.ts    # Persistent settings + dark mode
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css             # Design system CSS
│   └── package.json
│
├── server/                    # Express.js backend
│   ├── controllers/
│   │   └── conversionController.js  # Core logic
│   ├── routes/
│   │   └── conversionRoutes.js      # API routing
│   ├── services/
│   │   ├── documentConverter.js     # LibreOffice integration
│   │   ├── imageConverter.js        # Sharp + pdf-lib
│   │   ├── pdfMerger.js             # PDF merging
│   │   └── fileValidator.js         # MIME + extension validation
│   ├── utils/
│   │   └── cleanup.js               # Temp file cleanup
│   ├── uploads/               # Temporary upload storage
│   ├── output/                # Generated PDFs (auto-cleaned)
│   ├── server.js              # Entry point
│   └── package.json
│
├── package.json               # Root scripts
├── .gitignore
└── README.md
```

---

## Security

- File type validated by both MIME type and file extension
- Filenames are sanitized with `sanitize-filename`
- Random UUIDs used for storage paths (prevents path traversal)
- Server paths never exposed to the client
- Files auto-deleted after 5 minutes (configurable)
- Rate limiting on conversion endpoint (50 req/15min per IP)
- Helmet.js for HTTP security headers
- CORS restricted to configured origin

---

## Testing

### Manual Test Checklist

**Documents:** DOCX, DOC, TXT, RTF
**Presentations:** PPTX, PPT
**Spreadsheets:** XLSX, XLS, CSV
**Images:** JPG, PNG, WEBP

**Edge cases:**
- [ ] Unsupported file type → friendly error message
- [ ] File over 50 MB → size error
- [ ] Empty file → empty file error
- [ ] Multiple files → separate PDFs
- [ ] Multiple files in merge mode → single PDF
- [ ] Drag-to-reorder in merge mode → correct page order
- [ ] Dark mode toggle
- [ ] Mobile layout (< 768px)

### Check server health:
```bash
curl http://localhost:3001/api/health
```

### Test conversion via curl:
```bash
curl -X POST http://localhost:3001/api/convert \
  -F "files=@/path/to/document.docx" \
  -F "mode=separate" \
  -F "pageSize=A4"
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `LibreOffice conversion failed` | Ensure LibreOffice is installed and accessible in PATH |
| `CORS error` | Check `CORS_ORIGIN` in `server/.env` matches frontend URL |
| `File not found` | Files auto-expire after 5 min; convert again |
| `Sharp install fails` | Run `npm rebuild sharp` or check platform support |
| `Port in use` | Change `PORT` in `.env` or kill the process on that port |

---

## License

MIT — see [LICENSE](LICENSE) for details.
