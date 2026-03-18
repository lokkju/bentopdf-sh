import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { LibreOfficeEngine } from "../../src/engines/libreoffice.js";

describe("LibreOfficeEngine integration", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "lo-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("converts DOCX to PDF", async () => {
    const engine = new LibreOfficeEngine();
    const input = path.resolve("tests/fixtures/test.docx");
    const output = path.join(tmpDir, "out.pdf");

    await engine.convert(input, output);

    expect(fs.existsSync(output)).toBe(true);
    const data = fs.readFileSync(output);
    expect(data.toString("ascii", 0, 4)).toBe("%PDF");
  }, 60000); // LO-WASM can be slow on first load
});
