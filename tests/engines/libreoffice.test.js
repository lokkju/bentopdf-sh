import { describe, it, expect } from "vitest";
import { LibreOfficeEngine } from "../../src/engines/libreoffice.js";

describe("LibreOfficeEngine", () => {
  it("extends Engine", () => {
    const engine = new LibreOfficeEngine();
    expect(engine.name).toBe("libreoffice");
  });

  it("lists supported extensions", () => {
    const engine = new LibreOfficeEngine();
    const exts = engine.supportedExtensions();
    expect(exts).toContain("docx");
    expect(exts).toContain("pptx");
    expect(exts).toContain("xlsx");
    expect(exts).toContain("odt");
  });
});
