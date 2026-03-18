import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { resolveOutputPath, validateArgs } from "../../src/commands/to-pdf.js";

describe("resolveOutputPath", () => {
  it("replaces extension with .pdf for single file", () => {
    expect(resolveOutputPath("/tmp/doc.docx", null)).toBe("/tmp/doc.pdf");
  });

  it("uses explicit output path", () => {
    expect(resolveOutputPath("/tmp/doc.docx", "/out/final.pdf")).toBe("/out/final.pdf");
  });

  it("puts file in output directory when path ends with /", () => {
    const result = resolveOutputPath("/tmp/doc.docx", "/out/");
    expect(result).toBe("/out/doc.pdf");
  });
});

describe("validateArgs", () => {
  it("rejects multiple inputs with single file output", () => {
    expect(() => validateArgs(["/a.docx", "/b.docx"], "/out.pdf"))
      .toThrow("multiple inputs");
  });

  it("accepts multiple inputs with directory output", () => {
    expect(() => validateArgs(["/a.docx", "/b.docx"], "/out/"))
      .not.toThrow();
  });

  it("accepts multiple inputs with no output", () => {
    expect(() => validateArgs(["/a.docx", "/b.docx"], null))
      .not.toThrow();
  });

  it("rejects empty inputs", () => {
    expect(() => validateArgs([], null))
      .toThrow("No input files");
  });
});
