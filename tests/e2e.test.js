import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { execFileSync } from "node:child_process";

const CLI = path.resolve("bin/bentopdf.js");

describe("E2E: bentopdf CLI", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bentopdf-e2e-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("shows help", () => {
    const output = execFileSync("node", [CLI, "--help"], { encoding: "utf-8" });
    expect(output).toContain("to-pdf");
    expect(output).toContain("cache");
  });

  it("shows version", () => {
    const output = execFileSync("node", [CLI, "--version"], { encoding: "utf-8" });
    expect(output.trim()).toBe("0.1.0");
  });

  it("converts markdown to PDF", () => {
    const input = path.join(tmpDir, "test.md");
    const output = path.join(tmpDir, "test.pdf");
    fs.writeFileSync(input, "# Hello\n\nWorld");

    execFileSync("node", [CLI, "to-pdf", input, "-o", output], {
      encoding: "utf-8",
      timeout: 60000,
    });

    expect(fs.existsSync(output)).toBe(true);
    const data = fs.readFileSync(output);
    expect(data.toString("ascii", 0, 4)).toBe("%PDF");
  });

  it("converts PNG to PDF", () => {
    const input = path.resolve("tests/fixtures/test.png");
    const output = path.join(tmpDir, "test.pdf");

    execFileSync("node", [CLI, "to-pdf", input, "-o", output], {
      encoding: "utf-8",
      timeout: 60000,
    });

    expect(fs.existsSync(output)).toBe(true);
  });

  it("cache list works", () => {
    const output = execFileSync("node", [CLI, "cache", "list"], {
      encoding: "utf-8",
    });
    expect(typeof output).toBe("string");
  });
});
