import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { Cache } from "../src/cache.js";

describe("Cache", () => {
  let tmpDir;
  let cache;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bentopdf-test-"));
    cache = new Cache(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns correct engine path", () => {
    const p = cache.enginePath("mupdf", "1.0.0");
    expect(p).toBe(path.join(tmpDir, "engines", "mupdf", "1.0.0"));
  });

  it("reports engine as not cached when directory missing", () => {
    expect(cache.isCached("mupdf", "1.0.0")).toBe(false);
  });

  it("reports engine as cached when directory exists", () => {
    const p = cache.enginePath("mupdf", "1.0.0");
    fs.mkdirSync(p, { recursive: true });
    fs.writeFileSync(path.join(p, ".complete"), "");
    expect(cache.isCached("mupdf", "1.0.0")).toBe(true);
  });

  it("lists cached engines", () => {
    const p = cache.enginePath("mupdf", "1.0.0");
    fs.mkdirSync(p, { recursive: true });
    fs.writeFileSync(path.join(p, ".complete"), "");
    const list = cache.list();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("mupdf");
    expect(list[0].version).toBe("1.0.0");
  });

  it("clears all cached engines", () => {
    const p = cache.enginePath("mupdf", "1.0.0");
    fs.mkdirSync(p, { recursive: true });
    cache.clear();
    expect(fs.existsSync(path.join(tmpDir, "engines"))).toBe(false);
  });

  it("uses XDG cache dir by default", () => {
    const defaultCache = new Cache();
    const expected = path.join(
      process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache"),
      "bentopdf"
    );
    expect(defaultCache.baseDir).toBe(expected);
  });
});
