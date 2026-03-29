---
name: to-docx
description: >
  Convert Markdown or HTML to DOCX/PPTX using bentopdf-sh. Use when the user asks to
  convert markdown to word, create a docx, make a word document, export as docx,
  convert to pptx, make slides, create a presentation, or mentions "markdown to docx",
  "md to word", "markdown to pptx", "make a slide deck", "branded document", or asks
  to apply a template to a document.
  Supports Markdown and HTML input with optional reference document templates.
allowed-tools: "Bash(npx bentopdf-sh *), Bash(bentopdf *), Bash(file *), Bash(ls *), Read, Glob"
---

# Convert Markdown/HTML to DOCX or PPTX

The npm package is `bentopdf-sh`. The CLI command it installs is `bentopdf`.

## Check availability

```
!`which bentopdf 2>/dev/null && bentopdf --version 2>/dev/null || echo "NOT_INSTALLED"`
```

If NOT_INSTALLED, use npx (no install needed): `npx bentopdf-sh to-docx <file>`
Or install globally: `npm install -g bentopdf-sh`

## Supported input formats

**Markdown**: .md, .markdown
**HTML**: .html, .htm

## Commands

### Markdown/HTML → DOCX

```bash
bentopdf to-docx <input>                           # → input.docx in same directory
bentopdf to-docx <input> -o <output.docx>          # explicit output path
bentopdf to-docx <input> -t template.docx          # apply reference doc for styling
bentopdf to-docx *.md -o ./docs/                   # batch convert
```

### Markdown/HTML → PPTX

```bash
bentopdf to-pptx <input>                           # → input.pptx in same directory
bentopdf to-pptx <input> -o <output.pptx>          # explicit output path
bentopdf to-pptx <input> -t brand.pptx             # apply reference doc for styling
bentopdf to-pptx *.md -o ./slides/                 # batch convert
```

### Options

- `-o, --output <path>` — output file or directory (directory must end with `/`)
- `-t, --template <path>` — reference document for styling (fonts, headings, layout)
- `--verbose` — show conversion progress

## Template support

The `--template` flag accepts a reference document (.docx or .pptx) that controls:
- **DOCX**: fonts, heading styles, paragraph spacing, page margins, headers/footers
- **PPTX**: slide masters, fonts, colors, background, layout

This works like pandoc's `--reference-doc`. The template file must be a valid .docx or .pptx.

## PPTX slide structure

Pandoc splits slides on level-2 headings (`##`). Each `##` heading becomes a new slide title. Content under each `##` becomes the slide body. Level-1 headings (`#`) create title slides.

## Exit codes

- **0** — success
- **1** — conversion error
- **2** — bad arguments

## When converting

1. If the user provides a specific file, verify it exists, then convert it directly
2. If the user describes files vaguely ("convert all the markdown files"), use Glob to find them first
3. For multiple files, use batch mode with `-o ./output/` directory
4. If the user mentions a template, brand, or styling — ask if they have a reference document, then use `--template`
5. Always confirm the output path and that the file was created
6. If conversion fails, retry with `--verbose` and report the error

## If $ARGUMENTS is provided

Convert `$ARGUMENTS` now. First verify the file exists, then determine the right command:
- If the user asked for DOCX/Word: `bentopdf to-docx $ARGUMENTS`
- If the user asked for PPTX/slides/presentation: `bentopdf to-pptx $ARGUMENTS`
- If unclear, default to DOCX
