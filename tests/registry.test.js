import { describe, it, expect } from "vitest";
import { Registry } from "../src/registry.js";

describe("Registry", () => {
  it("resolves .docx to libreoffice engine", () => {
    const reg = new Registry();
    expect(reg.resolve(".docx")).toBe("libreoffice");
  });

  it("resolves .png to mupdf engine", () => {
    const reg = new Registry();
    expect(reg.resolve(".png")).toBe("mupdf");
  });

  it("resolves .md to pandoc pipeline", () => {
    const reg = new Registry();
    expect(reg.resolve(".md")).toBe("pandoc");
  });

  it("returns null for unsupported extension", () => {
    const reg = new Registry();
    expect(reg.resolve(".xyz")).toBeNull();
  });

  it("handles extensions with and without dot", () => {
    const reg = new Registry();
    expect(reg.resolve("docx")).toBe("libreoffice");
    expect(reg.resolve(".docx")).toBe("libreoffice");
  });

  it("lists all supported extensions", () => {
    const reg = new Registry();
    const exts = reg.supportedExtensions();
    expect(exts).toContain("docx");
    expect(exts).toContain("png");
    expect(exts).toContain("md");
    expect(exts.length).toBeGreaterThan(10);
  });
});
