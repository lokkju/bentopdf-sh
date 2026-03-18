// Pandoc-WASM Feasibility Spike
// Goal: Discover the actual pandoc-wasm API for Node.js
// Test: Markdown → HTML conversion

console.log("=== Pandoc-WASM Spike ===\n");

// Step 1: Discover exports
console.log("Step 1: Checking pandoc-wasm exports...");
const pandoc = await import("pandoc-wasm");
const exports = Object.keys(pandoc);
console.log("Exports:", exports.join(", "));
console.log();

// Step 2: Try converting markdown to HTML
console.log("Step 2: Markdown → HTML...");

const markdown = `# Test Document

This is a **bold** paragraph with *italic* text.

## Section 2

- Item 1
- Item 2
- Item 3

| Column A | Column B |
|----------|----------|
| Cell 1   | Cell 2   |
`;

try {
  // Try the assumed API first
  let result;
  try {
    result = await pandoc.convert(
      { from: "markdown", to: "html", standalone: true },
      markdown,
      {}
    );
    console.log("  convert(opts, text, {}) worked");
  } catch (e1) {
    console.log("  convert(opts, text, {}) failed:", e1.message);
    try {
      result = await pandoc.default(
        { from: "markdown", to: "html", standalone: true },
        markdown
      );
      console.log("  default(opts, text) worked");
    } catch (e2) {
      console.log("  default(opts, text) failed:", e2.message);
      // Try other patterns
      try {
        result = await pandoc.run({ from: "markdown", to: "html", input: markdown });
        console.log("  run(opts) worked");
      } catch (e3) {
        console.log("  run(opts) failed:", e3.message);
      }
    }
  }

  if (result) {
    console.log("  Result type:", typeof result);
    console.log("  Result keys:", Object.keys(result).join(", "));
    console.log("  Exit code:", result.exitCode);
    if (result.stderr) console.log("  Stderr:", result.stderr);
    console.log("  Output length:", result.stdout?.length || result.output?.length || "unknown");
    const output = result.stdout || result.output || String(result);
    console.log("  First 300 chars:", output.substring(0, 300));
    console.log("\n  Markdown → HTML: SUCCESS");
  }
} catch (err) {
  console.log("  Markdown → HTML: FAILED:", err.message);
  console.log("  Stack:", err.stack);
}

console.log("\n=== Done ===");
