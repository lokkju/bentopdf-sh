// LibreOffice-WASM Feasibility Spike - Round 3
// Key finding: needs wasmLoader from "@matbee/libreoffice-converter/wasm/loader.cjs"
// and LibreOfficeConverter({ wasmLoader }) + initialize()

import * as fs from "node:fs";
import { createRequire } from "node:module";
import { LibreOfficeConverter } from "@matbee/libreoffice-converter/server";

const require = createRequire(import.meta.url);
const wasmLoader = require("@matbee/libreoffice-converter/wasm/loader");

console.log("=== LibreOffice-WASM Spike (Round 3) ===\n");

const __dirname = new URL(".", import.meta.url).pathname;
const docxData = fs.readFileSync(new URL("fixtures/test.docx", import.meta.url));
console.log("DOCX size:", docxData.length, "bytes\n");

console.log("Creating converter with wasmLoader...");
const converter = new LibreOfficeConverter({ wasmLoader });

console.log("Initializing (this downloads WASM on first run, may take a while)...");
const initStart = Date.now();
await converter.initialize();
console.log("Initialized in", Date.now() - initStart, "ms\n");

console.log("Converting DOCX → PDF...");
const convertStart = Date.now();
const result = await converter.convert(docxData, { outputFormat: "pdf", inputFormat: "docx" });
console.log("Conversion took:", Date.now() - convertStart, "ms");

console.log("Result type:", typeof result);
if (result && typeof result === "object") {
  console.log("Keys:", Object.keys(result));
  console.log("mimeType:", result.mimeType);
  console.log("filename:", result.filename);
  console.log("duration:", result.duration);

  const data = result.data;
  if (data) {
    const buf = Buffer.from(data);
    const outPath = new URL("output-docx.pdf", import.meta.url).pathname;
    fs.writeFileSync(outPath, buf);
    console.log("Output size:", buf.length, "bytes");
    console.log("Header:", buf.slice(0, 4).toString("ascii"));
    console.log("\nDOCX → PDF: SUCCESS");
  }
} else if (Buffer.isBuffer(result) || result instanceof Uint8Array) {
  const buf = Buffer.from(result);
  fs.writeFileSync(new URL("output-docx.pdf", import.meta.url).pathname, buf);
  console.log("Output size:", buf.length, "bytes");
  console.log("\nDOCX → PDF: SUCCESS");
}

console.log("\nCleaning up...");
await converter.destroy();

console.log("\n=== Done ===");

/*
API SUMMARY:
  import { LibreOfficeConverter } from "@matbee/libreoffice-converter/server";
  import { createRequire } from "node:module";
  const require = createRequire(import.meta.url);
  const wasmLoader = require("@matbee/libreoffice-converter/wasm/loader");

  const converter = new LibreOfficeConverter({ wasmLoader });
  await converter.initialize();
  const pdfBuffer = await converter.convert(inputBuffer, "pdf");
  await converter.destroy();

  - convert() takes (Buffer, outputFormat) and returns a Buffer
  - initialize() downloads WASM files on first run (~150MB)
  - Must call destroy() to clean up
*/
