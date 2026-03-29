import { describe, it, expect } from "vitest";
import { buildCli } from "../src/cli.js";

describe("CLI argument parsing", () => {
  it("parses to-pdf with single input", async () => {
    const cli = buildCli();
    const parsed = await cli.parseAsync(["to-pdf", "doc.docx"]);
    expect(parsed._[0]).toBe("to-pdf");
    expect(parsed.input).toEqual(["doc.docx"]);
  });

  it("parses to-pdf with output option", async () => {
    const cli = buildCli();
    const parsed = await cli.parseAsync(["to-pdf", "doc.docx", "-o", "out.pdf"]);
    expect(parsed.output).toBe("out.pdf");
  });

  it("parses to-pdf with engine override", async () => {
    const cli = buildCli();
    const parsed = await cli.parseAsync(["to-pdf", "doc.docx", "--engine", "mupdf"]);
    expect(parsed.engine).toBe("mupdf");
  });

  it("parses to-pdf with verbose flag", async () => {
    const cli = buildCli();
    const parsed = await cli.parseAsync(["to-pdf", "doc.docx", "--verbose"]);
    expect(parsed.verbose).toBe(true);
  });

  it("parses to-docx with single input", async () => {
    const cli = buildCli();
    const parsed = await cli.parseAsync(["to-docx", "notes.md"]);
    expect(parsed._[0]).toBe("to-docx");
    expect(parsed.input).toEqual(["notes.md"]);
  });

  it("parses to-docx with template option", async () => {
    const cli = buildCli();
    const parsed = await cli.parseAsync(["to-docx", "notes.md", "-t", "template.docx"]);
    expect(parsed.template).toBe("template.docx");
  });

  it("parses to-pptx with single input", async () => {
    const cli = buildCli();
    const parsed = await cli.parseAsync(["to-pptx", "slides.md"]);
    expect(parsed._[0]).toBe("to-pptx");
    expect(parsed.input).toEqual(["slides.md"]);
  });

  it("parses to-pptx with output and template", async () => {
    const cli = buildCli();
    const parsed = await cli.parseAsync(["to-pptx", "slides.md", "-o", "out.pptx", "-t", "brand.pptx"]);
    expect(parsed.output).toBe("out.pptx");
    expect(parsed.template).toBe("brand.pptx");
  });
});
