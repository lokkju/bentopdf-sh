import { describe, it, expect } from "vitest";
import { PandocEngine } from "../../src/engines/pandoc.js";

describe("PandocEngine", () => {
  it("extends Engine", () => {
    const engine = new PandocEngine();
    expect(engine.name).toBe("pandoc");
  });

  it("lists supported extensions", () => {
    const engine = new PandocEngine();
    const exts = engine.supportedExtensions();
    expect(exts).toContain("md");
    expect(exts).toContain("html");
  });
});
