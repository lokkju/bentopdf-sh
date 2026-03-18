---
name: to-pdf
description: >
  Convert documents to PDF. Use when the user asks to convert files to PDF,
  mentions document conversion (e.g. "docx to pdf", "make a pdf", "convert
  to pdf", "export as pdf"), or has document files that need to become PDFs.
  Handles Word, PowerPoint, Excel, OpenDocument, Markdown, HTML, and images.
argument-hint: "[file or glob pattern]"
allowed-tools: "Bash(npx bentopdf-sh *), Bash(bentopdf *), Read, Glob"
---

# Convert Documents to PDF

You have `bentopdf-sh`, a CLI tool that converts documents to PDF using WASM engines locally. No network upload, no native dependencies beyond Node.js.

## Check availability

```
!`which bentopdf 2>/dev/null && bentopdf --version 2>/dev/null || echo "NOT_INSTALLED"`
```

If NOT_INSTALLED, install with: `npm install -g bentopdf-sh`
Or use npx: `npx bentopdf-sh to-pdf <file>`

## Supported formats

**Office** (LibreOffice-WASM): .docx, .doc, .pptx, .ppt, .xlsx, .xls, .odt, .ods, .odp, .rtf
**Markup** (Pandoc + MuPDF): .md, .markdown, .html, .htm
**Images** (MuPDF): .jpg, .jpeg, .png, .svg, .tiff, .tif, .webp

## Commands

Single file:
```bash
bentopdf to-pdf <input>                  # → input.pdf in same directory
bentopdf to-pdf <input> -o <output.pdf>  # explicit output path
```

Batch:
```bash
bentopdf to-pdf *.docx -o ./pdfs/        # all to a directory
```

Options:
- `-o, --output <path>` — output file or directory (directory must end with `/`)
- `--engine <name>` — force engine: `mupdf`, `pandoc`, or `libreoffice`
- `--verbose` — show conversion progress

## When converting

1. If the user provides a specific file, convert it directly
2. If the user describes files vaguely ("convert all the word docs"), use Glob to find them first
3. For multiple files, use batch mode with `-o ./output/` directory
4. Always confirm the output path and that the PDF was created
5. If conversion fails, retry with `--verbose` and report the error

## If $ARGUMENTS is provided

Convert `$ARGUMENTS` to PDF now:
```bash
bentopdf to-pdf $ARGUMENTS
```
