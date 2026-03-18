// MuPDF Feasibility Spike
// Goal: Discover the actual mupdf npm API for Node.js
// Test: image→PDF and HTML→PDF conversion

import * as fs from "node:fs";
import * as path from "node:path";

console.log("=== MuPDF Spike ===\n");

// Step 1: Discover exports
console.log("Step 1: Checking mupdf exports...");
const mupdf = await import("mupdf");
const exports = Object.keys(mupdf);
console.log("Exports:", exports.join(", "));
console.log();

// Check for key classes
for (const name of ["Document", "DocumentWriter", "Buffer", "Matrix", "PDFDocument"]) {
  console.log(`  ${name}: ${typeof mupdf[name]}`);
}
console.log();

// Step 2: Try image to PDF
console.log("Step 2: Image → PDF...");
try {
  const imgData = fs.readFileSync("spikes/fixtures/test.png");

  // Try different API patterns
  let doc;
  try {
    doc = mupdf.Document.openDocument(imgData, "image/png");
    console.log("  openDocument(buffer, mime) worked");
  } catch (e1) {
    console.log("  openDocument(buffer, mime) failed:", e1.message);
    try {
      doc = mupdf.Document.openDocument(imgData, "test.png");
      console.log("  openDocument(buffer, filename) worked");
    } catch (e2) {
      console.log("  openDocument(buffer, filename) failed:", e2.message);
      try {
        doc = new mupdf.Document(imgData);
        console.log("  new Document(buffer) worked");
      } catch (e3) {
        console.log("  new Document(buffer) failed:", e3.message);
      }
    }
  }

  if (doc) {
    console.log("  Page count:", doc.countPages());
    const page = doc.loadPage(0);
    console.log("  Page bounds:", page.getBounds());

    // Try DocumentWriter
    let buf;
    try {
      buf = new mupdf.Buffer();
      console.log("  new Buffer() worked");
    } catch {
      try {
        buf = mupdf.Buffer();
        console.log("  Buffer() worked");
      } catch (e) {
        console.log("  Buffer creation failed:", e.message);
      }
    }

    if (buf) {
      const writer = new mupdf.DocumentWriter(buf, "pdf", "");
      const bounds = page.getBounds();
      const dev = writer.beginPage(bounds);
      page.run(dev, mupdf.Matrix.identity);
      writer.endPage();
      writer.close();

      let pdfBytes;
      try {
        pdfBytes = buf.asUint8Array();
        console.log("  buf.asUint8Array() worked");
      } catch {
        try {
          pdfBytes = buf.toUint8Array();
          console.log("  buf.toUint8Array() worked");
        } catch {
          try {
            pdfBytes = Buffer.from(buf);
            console.log("  Buffer.from(buf) worked");
          } catch (e) {
            console.log("  Getting bytes from buffer failed:", e.message);
          }
        }
      }

      if (pdfBytes) {
        fs.writeFileSync("spikes/output-image.pdf", pdfBytes);
        const header = pdfBytes.slice(0, 4);
        console.log("  Output header:", String.fromCharCode(...header));
        console.log("  Image → PDF: SUCCESS (" + pdfBytes.length + " bytes)");
      }
    }
  }
} catch (err) {
  console.log("  Image → PDF: FAILED:", err.message);
  console.log("  Stack:", err.stack);
}

console.log();

// Step 3: Try HTML to PDF
console.log("Step 3: HTML → PDF...");
try {
  const html = "<html><body><h1>Hello World</h1><p>This is a <b>test</b>.</p></body></html>";
  const htmlBuf = new TextEncoder().encode(html);

  let doc;
  try {
    doc = mupdf.Document.openDocument(htmlBuf, "text/html");
    console.log("  openDocument(buffer, 'text/html') worked");
  } catch (e1) {
    console.log("  openDocument(buffer, 'text/html') failed:", e1.message);
    try {
      doc = mupdf.Document.openDocument(htmlBuf, "test.html");
      console.log("  openDocument(buffer, 'test.html') worked");
    } catch (e2) {
      console.log("  openDocument(buffer, 'test.html') failed:", e2.message);
    }
  }

  if (doc) {
    console.log("  Page count:", doc.countPages());

    const buf = new mupdf.Buffer();
    const writer = new mupdf.DocumentWriter(buf, "pdf", "");

    for (let i = 0; i < doc.countPages(); i++) {
      const page = doc.loadPage(i);
      const bounds = page.getBounds();
      const dev = writer.beginPage(bounds);
      page.run(dev, mupdf.Matrix.identity);
      writer.endPage();
    }

    writer.close();
    const pdfBytes = buf.asUint8Array();
    fs.writeFileSync("spikes/output-html.pdf", pdfBytes);
    console.log("  HTML → PDF: SUCCESS (" + pdfBytes.length + " bytes)");
  }
} catch (err) {
  console.log("  HTML → PDF: FAILED:", err.message);
  console.log("  Stack:", err.stack);
}

console.log("\n=== Done ===");
