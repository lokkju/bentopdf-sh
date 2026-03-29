import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { PandocEngine } from "../../src/engines/pandoc.js";

describe("PandocEngine.convertTo integration", () => {
  it("converts Markdown to DOCX", async () => {
    const engine = new PandocEngine();
    const input = path.resolve("tests/fixtures/test.md");
    const output = path.join(os.tmpdir(), `bentopdf-test-${Date.now()}.docx`);

    try {
      await engine.convertTo(input, output, { toFormat: "docx" });
      expect(fs.existsSync(output)).toBe(true);
      const stat = fs.statSync(output);
      expect(stat.size).toBeGreaterThan(0);
      // DOCX files are ZIP archives starting with PK
      const header = fs.readFileSync(output).subarray(0, 2);
      expect(header[0]).toBe(0x50); // P
      expect(header[1]).toBe(0x4b); // K
    } finally {
      if (fs.existsSync(output)) fs.unlinkSync(output);
    }
  });

  it("converts Markdown to PPTX", async () => {
    const engine = new PandocEngine();
    const input = path.resolve("tests/fixtures/test.md");
    const output = path.join(os.tmpdir(), `bentopdf-test-${Date.now()}.pptx`);

    try {
      await engine.convertTo(input, output, { toFormat: "pptx" });
      expect(fs.existsSync(output)).toBe(true);
      const stat = fs.statSync(output);
      expect(stat.size).toBeGreaterThan(0);
      const header = fs.readFileSync(output).subarray(0, 2);
      expect(header[0]).toBe(0x50);
      expect(header[1]).toBe(0x4b);
    } finally {
      if (fs.existsSync(output)) fs.unlinkSync(output);
    }
  });

  it("rejects unsupported output format", async () => {
    const engine = new PandocEngine();
    const input = path.resolve("tests/fixtures/test.md");
    const output = path.join(os.tmpdir(), "bad.xyz");

    await expect(
      engine.convertTo(input, output, { toFormat: "xyz" })
    ).rejects.toThrow("unsupported output format");
  });

  it("rejects unsupported input format", async () => {
    const engine = new PandocEngine();
    const input = path.resolve("tests/fixtures/test.png");
    const output = path.join(os.tmpdir(), "bad.docx");

    await expect(
      engine.convertTo(input, output, { toFormat: "docx" })
    ).rejects.toThrow("unsupported input format");
  });
});
