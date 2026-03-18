---
name: bentopdf
description: Convert documents to PDF using bentopdf-cli. Use when the user asks to convert files to PDF, mentions "docx to pdf", "make a pdf", "pdf conversion", or asks about supported document conversion formats.
---

# bentopdf-cli — Document to PDF Conversion

You have access to `bentopdf-cli`, a local CLI tool that converts documents to PDF using WASM engines. No native dependencies required — just Node.js.

## Quick Reference

### Convert a file to PDF
```bash
npx bentopdf-cli to-pdf <input>
```

### With explicit output path
```bash
npx bentopdf-cli to-pdf report.docx -o final.pdf
```

### Batch convert
```bash
npx bentopdf-cli to-pdf *.docx -o ./pdfs/
```

## Supported Input Formats

| Format | Extensions | Engine |
|--------|-----------|--------|
| Word | .docx, .doc | LibreOffice-WASM |
| PowerPoint | .pptx, .ppt | LibreOffice-WASM |
| Excel | .xlsx, .xls | LibreOffice-WASM |
| OpenDocument | .odt, .ods, .odp | LibreOffice-WASM |
| Rich Text | .rtf | LibreOffice-WASM |
| Markdown | .md, .markdown | Pandoc + MuPDF |
| HTML | .html, .htm | Pandoc + MuPDF |
| Images | .jpg, .jpeg, .png, .svg, .tiff, .webp | MuPDF |

## Options

- `-o, --output <path>` — Output file or directory (default: same name with .pdf extension)
- `--engine <name>` — Force a specific engine: `mupdf`, `pandoc`, or `libreoffice`
- `--verbose` — Show detailed conversion progress

## Cache Management

WASM engines are downloaded on first use and cached locally.

```bash
npx bentopdf-cli cache list      # Show cached engines
npx bentopdf-cli cache clear     # Remove all cached engines
```

## Usage Guidelines

1. **Check installation first**: Run `npx bentopdf-cli --version` to verify it's available
2. **Single file**: `npx bentopdf-cli to-pdf document.docx` — outputs `document.pdf` in same directory
3. **Batch to directory**: `npx bentopdf-cli to-pdf *.pptx -o ./pdfs/` — all PDFs go to `./pdfs/`
4. **Multiple inputs with -o**: The `-o` must be a directory (ending in `/`) when converting multiple files
5. **First run**: The first conversion for each format type will download the required WASM engine — this is a one-time operation

## Error Handling

- If conversion fails, suggest `--verbose` for detailed output
- If an engine fails to download, suggest `bentopdf cache clear` then retry
- Exit code 0 = success, 1 = conversion error, 2 = bad arguments, 3 = download failure
