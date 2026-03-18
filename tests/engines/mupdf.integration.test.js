import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { MuPdfEngine } from "../../src/engines/mupdf.js";

describe("MuPdfEngine integration", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mupdf-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("converts PNG to PDF", async () => {
    const engine = new MuPdfEngine();
    const input = path.resolve("tests/fixtures/test.png");
    const output = path.join(tmpDir, "out.pdf");

    await engine.convert(input, output);

    expect(fs.existsSync(output)).toBe(true);
    const data = fs.readFileSync(output);
    expect(data.toString("ascii", 0, 4)).toBe("%PDF");
  });
});
