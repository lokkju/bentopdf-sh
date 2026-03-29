import { describe, it, expect } from "vitest";
import { resolveOutputPath, validateArgs } from "../../src/commands/to-format.js";

describe("resolveOutputPath (to-format)", () => {
  it("replaces extension with target format for single file", () => {
    expect(resolveOutputPath("/tmp/doc.md", null, "docx")).toBe("/tmp/doc.docx");
  });

  it("replaces extension with pptx", () => {
    expect(resolveOutputPath("/tmp/slides.md", null, "pptx")).toBe("/tmp/slides.pptx");
  });

  it("uses explicit output path", () => {
    expect(resolveOutputPath("/tmp/doc.md", "/out/final.docx", "docx")).toBe("/out/final.docx");
  });

  it("puts file in output directory when path ends with /", () => {
    const result = resolveOutputPath("/tmp/doc.md", "/out/", "docx");
    expect(result).toBe("/out/doc.docx");
  });
});

describe("validateArgs (to-format)", () => {
  it("rejects multiple inputs with single file output", () => {
    expect(() => validateArgs(["/a.md", "/b.md"], "/out.docx"))
      .toThrow("multiple inputs");
  });

  it("accepts multiple inputs with directory output", () => {
    expect(() => validateArgs(["/a.md", "/b.md"], "/out/"))
      .not.toThrow();
  });

  it("accepts multiple inputs with no output", () => {
    expect(() => validateArgs(["/a.md", "/b.md"], null))
      .not.toThrow();
  });

  it("rejects empty inputs", () => {
    expect(() => validateArgs([], null))
      .toThrow("No input files");
  });
});
