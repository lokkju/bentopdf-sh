import { describe, it, expect } from "vitest";
import { Engine } from "../../src/engines/base.js";

describe("Engine base class", () => {
  it("stores engine name", () => {
    const engine = new Engine("test");
    expect(engine.name).toBe("test");
  });

  it("convert() throws not-implemented", async () => {
    const engine = new Engine("test");
    await expect(engine.convert("a", "b")).rejects.toThrow("not implemented");
  });

  it("supportedExtensions() throws not-implemented", () => {
    const engine = new Engine("test");
    expect(() => engine.supportedExtensions()).toThrow("not implemented");
  });

  it("ensureLoaded() throws not-implemented", async () => {
    const engine = new Engine("test");
    await expect(engine.ensureLoaded()).rejects.toThrow("not implemented");
  });
});
