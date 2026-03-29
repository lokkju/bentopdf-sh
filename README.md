# bentopdf-sh

A command-line interface for document-to-PDF conversion, powered by [BentoPDF](https://github.com/alam00000/bentopdf).

BentoPDF is a privacy-first, self-hosted PDF toolkit that runs entirely client-side using WebAssembly. It provides 50+ document tools through a browser interface. **bentopdf-sh** brings those same WASM engines to the command line, so you can convert documents without opening a browser.

All the heavy lifting is done by BentoPDF's engines. We just make them accessible from your terminal.

## Install

```bash
npx bentopdf-sh to-pdf document.docx
```

Or install globally:

```bash
npm install -g bentopdf-sh
bentopdf to-pdf document.docx
```

Requires Node.js 20+.

### Claude Code / AI Agent Integration

Add the `to-pdf` skill to your AI coding agent:

```bash
npx skills add lokkju/bentopdf-sh -a claude-code
```

Or install as a Claude Code plugin:

```
/plugin marketplace add lokkju/bentopdf-sh
```

This lets your agent convert documents to PDF directly when you ask it to.

## Usage

### Convert a file to PDF

```bash
bentopdf to-pdf report.docx                    # outputs report.pdf
bentopdf to-pdf slides.pptx -o presentation.pdf # explicit output
bentopdf to-pdf *.docx -o ./pdfs/               # batch convert
```

### Convert Markdown to DOCX or PPTX

```bash
bentopdf to-docx notes.md                          # outputs notes.docx
bentopdf to-pptx slides.md -o presentation.pptx    # explicit output
bentopdf to-docx notes.md -t brand-template.docx   # apply a reference doc
bentopdf to-pptx slides.md -t corporate.pptx       # branded slide deck
```

Use `--template` (`-t`) to apply a reference document — this controls fonts, heading styles, page layout, and other formatting. Works like pandoc's `--reference-doc`.

### Supported formats

| Format | Extensions | Engine |
|--------|-----------|--------|
| Word | .docx, .doc | LibreOffice-WASM |
| PowerPoint | .pptx, .ppt | LibreOffice-WASM |
| Excel | .xlsx, .xls | LibreOffice-WASM |
| OpenDocument | .odt, .ods, .odp | LibreOffice-WASM |
| Rich Text | .rtf | LibreOffice-WASM |
| Markdown | .md, .markdown | Pandoc + MuPDF |
| HTML | .html, .htm | Pandoc + MuPDF |
| Images | .jpg, .png, .svg, .tiff, .webp | MuPDF |

### Options (to-pdf)

```
-o, --output <path>   Output file or directory
--engine <name>       Force engine: mupdf, pandoc, or libreoffice
--verbose             Show detailed progress
```

### Options (to-docx / to-pptx)

```
-o, --output <path>     Output file or directory
-t, --template <path>   Reference document for styling
--verbose               Show detailed progress
```

### Cache management

WASM engines are cached locally after first use.

```bash
bentopdf cache list    # show cached engines
bentopdf cache clear   # remove all cached engines
```

## How it works

bentopdf-sh wraps three WASM engines as npm packages, running them in Node.js instead of the browser:

- **[MuPDF](https://mupdf.com/)** (via `mupdf` npm package) — images and HTML to PDF
- **[Pandoc](https://pandoc.org/)** (via `pandoc-wasm`) — Markdown to HTML, then MuPDF renders to PDF
- **[LibreOffice](https://www.libreoffice.org/)** (via `@matbee/libreoffice-converter`) — Office documents to PDF

The format registry automatically picks the right engine based on file extension. No configuration needed.

## Beyond BentoPDF

Some features in bentopdf-sh go beyond what BentoPDF offers in the browser, by leveraging pandoc-wasm's full capabilities:

| Feature | Command | Description |
|---------|---------|-------------|
| Markdown → DOCX | `to-docx` | Convert Markdown/HTML to Word documents via pandoc-wasm |
| Markdown → PPTX | `to-pptx` | Convert Markdown/HTML to PowerPoint presentations via pandoc-wasm |
| Template support | `--template` | Apply a reference document (.docx/.pptx) for branded output — controls fonts, styles, and layout |

These work because pandoc-wasm exposes the full pandoc-server API, which supports output formats and reference documents that BentoPDF's browser interface doesn't expose.

## Feature Parity Roadmap

BentoPDF provides 100+ tools across six categories (as of 2026-03-17). Here's what bentopdf-sh supports today and what's planned. Vote on or open [issues](https://github.com/lokkju/bentopdf-sh/issues) to help guide development priorities.

### Convert to PDF

- [x] Word (.docx, .doc)
- [x] Excel (.xlsx, .xls)
- [x] PowerPoint (.pptx, .ppt)
- [x] OpenDocument Text (.odt)
- [x] OpenDocument Spreadsheet (.ods)
- [x] OpenDocument Presentation (.odp)
- [x] Rich Text (.rtf)
- [x] Markdown (.md)
- [x] HTML (.html, .htm)
- [x] Images — JPG, PNG, SVG, TIFF, WebP
- [ ] BMP, HEIC, PSD
- [ ] CSV, Text, JSON, XML
- [ ] EPUB, MOBI, FB2
- [ ] CBZ (Comic Books)
- [ ] XPS
- [ ] Email (.eml, .msg)
- [ ] Apple Pages
- [ ] WordPerfect (.wpd)
- [ ] Microsoft Works (.wps)
- [ ] Microsoft Publisher (.pub)
- [ ] Microsoft Visio (.vsd)
- [ ] OpenDocument Drawing (.odg)

### Convert from PDF

- [ ] PDF to Image (JPG, PNG, WebP, BMP, TIFF, SVG)
- [ ] PDF to Greyscale
- [ ] PDF to Text
- [ ] PDF to JSON / CSV / Excel
- [ ] Extract Tables
- [ ] OCR PDF

### Organize & Manage

- [ ] Merge PDFs
- [ ] Split PDF
- [ ] Extract / Delete / Rotate Pages
- [ ] Organize / Reorder Pages
- [ ] N-Up / Booklet / Posterize
- [ ] Alternate & Mix Pages
- [ ] Divide / Combine Pages
- [ ] Add Blank Page / Reverse Pages
- [ ] Attachments (Add / Extract / Edit)
- [ ] View Metadata
- [ ] Compare PDFs
- [ ] PDFs to ZIP

### Edit & Modify

- [ ] PDF Editor / Annotate
- [ ] Fillable Forms / Form Filler
- [ ] Add Page Numbers / Bates Numbering
- [ ] Watermark / Stamps
- [ ] Header & Footer
- [ ] Crop / Deskew
- [ ] Font to Outline
- [ ] Color adjustments (Invert, Background, Text Color)
- [ ] Flatten PDF
- [ ] Remove Annotations / Blank Pages
- [ ] Edit Bookmarks / Table of Contents
- [ ] Redact Content
- [ ] Scanner Effect

### Secure & Optimize

- [ ] Compress PDF
- [ ] Repair PDF
- [ ] Encrypt / Decrypt
- [ ] Change Permissions / Remove Restrictions
- [ ] Digital Signatures (Sign / Validate)
- [ ] Metadata (Edit / Remove / Sanitize)
- [ ] Linearize for Web
- [ ] Fix Page Size / Page Dimensions

### Automate

- [ ] Pipeline / Workflow Builder (chain multiple operations)

> Want a feature prioritized? [Open an issue](https://github.com/lokkju/bentopdf-sh/issues) or upvote an existing one.

## Acknowledgments

This project exists because of **[BentoPDF](https://bentopdf.com/)** by [@alam00000](https://github.com/alam00000). BentoPDF pioneered the approach of running document conversion engines entirely client-side via WebAssembly, and provides a comprehensive browser-based toolkit with 50+ tools across five categories. bentopdf-sh is a CLI wrapper around the same underlying WASM technology — BentoPDF did the hard work of making these engines run in JavaScript, we just plugged in a command-line interface.

If you need a browser-based solution or a self-hosted web app, use [BentoPDF](https://github.com/alam00000/bentopdf) directly.

## License

AGPL-3.0-or-later. See [LICENSE.md](LICENSE.md).

This license is required by our dependency chain — [MuPDF](https://mupdf.com/) is AGPL-3.0 and [Pandoc](https://pandoc.org/) is GPL-2.0. BentoPDF itself is also AGPL-3.0.
