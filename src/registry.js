const FORMAT_MAP = {
  // LibreOffice-WASM
  docx: "libreoffice",
  doc: "libreoffice",
  pptx: "libreoffice",
  ppt: "libreoffice",
  xlsx: "libreoffice",
  xls: "libreoffice",
  odt: "libreoffice",
  ods: "libreoffice",
  odp: "libreoffice",
  rtf: "libreoffice",

  // MuPDF
  jpg: "mupdf",
  jpeg: "mupdf",
  png: "mupdf",
  svg: "mupdf",
  tiff: "mupdf",
  tif: "mupdf",
  webp: "mupdf",

  // Pandoc pipeline
  md: "pandoc",
  markdown: "pandoc",
  html: "pandoc",
  htm: "pandoc",
};

export class Registry {
  resolve(ext) {
    const normalized = ext.startsWith(".") ? ext.slice(1) : ext;
    return FORMAT_MAP[normalized.toLowerCase()] ?? null;
  }

  supportedExtensions() {
    return Object.keys(FORMAT_MAP);
  }
}
