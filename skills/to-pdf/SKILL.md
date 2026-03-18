---
name: to-pdf
description: >
  Convert documents to PDF using bentopdf-sh. Use when the user asks to convert
  files to PDF, generate a PDF, save or export as PDF, print to PDF, turn a file
  into a PDF, or mentions "docx to pdf", "make a pdf", "create a pdf from",
  "pdf from markdown", or asks to use bentopdf or bentopdf-sh.
  Handles Word, PowerPoint, Excel, OpenDocument, RTF, Markdown, HTML, and images.
allowed-tools: "Bash(npx bentopdf-sh *), Bash(bentopdf *), Bash(file *), Bash(ls *), Read, Glob"
---

# Convert Documents to PDF

The npm package is `bentopdf-sh`. The CLI command it installs is `bentopdf`.

## Check availability

```
!`which bentopdf 2>/dev/null && bentopdf --version 2>/dev/null || echo "NOT_INSTALLED"`
```

If NOT_INSTALLED, use npx (no install needed): `npx bentopdf-sh to-pdf <file>`
Or install globally: `npm install -g bentopdf-sh`

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

## Exit codes

- **0** — success
- **1** — conversion error
- **2** — bad arguments (wrong flags, -o conflict with multiple inputs)
- **3** — engine download failure

## When converting

1. If the user provides a specific file, verify it exists, then convert it directly
2. If the user describes files vaguely ("convert all the word docs"), use Glob to find them first
3. For multiple files, use batch mode with `-o ./output/` directory
4. Always confirm the output path and that the PDF was created
5. If conversion fails, retry with `--verbose` and report the error
6. If exit code is 3 (download failure), suggest `bentopdf cache clear` then retry

## Troubleshooting

WASM engines are cached locally after first download. If engines fail to load:
```bash
bentopdf cache list    # show cached engines and sizes
bentopdf cache clear   # remove all cached engines, re-download on next use
```

## If $ARGUMENTS is provided

Convert `$ARGUMENTS` to PDF now. First verify the file exists, then run:
```bash
bentopdf to-pdf $ARGUMENTS
```
