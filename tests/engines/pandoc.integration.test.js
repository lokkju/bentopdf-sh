import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { PandocEngine } from "../../src/engines/pandoc.js";

describe("PandocEngine integration", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pandoc-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("converts Markdown to PDF", async () => {
    const engine = new PandocEngine();
    const input = path.join(tmpDir, "test.md");
    const output = path.join(tmpDir, "test.pdf");

    fs.writeFileSync(input, "# Hello World\n\nThis is a test.");
    await engine.convert(input, output);

    expect(fs.existsSync(output)).toBe(true);
    const data = fs.readFileSync(output);
    expect(data.toString("ascii", 0, 4)).toBe("%PDF");
  });

  it("converts HTML to PDF", async () => {
    const engine = new PandocEngine();
    const input = path.join(tmpDir, "test.html");
    const output = path.join(tmpDir, "test.pdf");

    fs.writeFileSync(input, "<html><body><h1>Test</h1></body></html>");
    await engine.convert(input, output);

    expect(fs.existsSync(output)).toBe(true);
  });
});
