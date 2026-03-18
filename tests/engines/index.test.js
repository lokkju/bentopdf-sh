import { describe, it, expect } from "vitest";
import { getEngine } from "../../src/engines/index.js";

describe("getEngine", () => {
  it("returns MuPdfEngine for 'mupdf'", () => {
    const engine = getEngine("mupdf");
    expect(engine.name).toBe("mupdf");
  });

  it("returns PandocEngine for 'pandoc'", () => {
    const engine = getEngine("pandoc");
    expect(engine.name).toBe("pandoc");
  });

  it("returns LibreOfficeEngine for 'libreoffice'", () => {
    const engine = getEngine("libreoffice");
    expect(engine.name).toBe("libreoffice");
  });

  it("throws for unknown engine", () => {
    expect(() => getEngine("unknown")).toThrow("Unknown engine: unknown");
  });

  it("caches engine instances (singleton)", () => {
    const a = getEngine("mupdf");
    const b = getEngine("mupdf");
    expect(a).toBe(b);
  });
});
