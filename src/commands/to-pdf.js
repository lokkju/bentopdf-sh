import * as fs from "node:fs";
import * as path from "node:path";
import { Registry } from "../registry.js";
import { getEngine } from "../engines/index.js";

const registry = new Registry();

export function resolveOutputPath(inputPath, outputArg) {
  if (!outputArg) {
    const dir = path.dirname(inputPath);
    const base = path.basename(inputPath, path.extname(inputPath));
    return path.join(dir, `${base}.pdf`);
  }

  // If output ends with / or is an existing directory, put file inside it
  const isDir = outputArg.endsWith(path.sep) || outputArg.endsWith("/") ||
    (fs.existsSync(outputArg) && fs.statSync(outputArg).isDirectory());

  if (isDir) {
    const base = path.basename(inputPath, path.extname(inputPath));
    return path.join(outputArg, `${base}.pdf`);
  }

  return outputArg;
}

export function validateArgs(inputs, output) {
  if (inputs.length === 0) {
    throw new Error("No input files provided");
  }

  if (inputs.length > 1 && output && !output.endsWith(path.sep) && !output.endsWith("/")) {
    // Check if it's an existing directory
    if (!fs.existsSync(output) || !fs.statSync(output).isDirectory()) {
      throw new Error(
        "Cannot use a single filename as output for multiple inputs. " +
        "Use a directory path (ending with /) instead."
      );
    }
  }
}

export async function toPdf(inputs, options = {}) {
  validateArgs(inputs, options.output);

  const results = [];

  for (const inputPath of inputs) {
    const absInput = path.resolve(inputPath);
    const outputPath = resolveOutputPath(absInput, options.output);

    try {
      if (!fs.existsSync(absInput)) {
        throw new Error(`File not found: ${absInput}`);
      }

      const ext = path.extname(absInput).slice(1).toLowerCase();
      const engineName = options.engine || registry.resolve(ext);

      if (!engineName) {
        const supported = registry.supportedExtensions().join(", ");
        throw new Error(
          `Unsupported format: .${ext}\nSupported formats: ${supported}`
        );
      }

      const engine = getEngine(engineName);

      if (options.engine && !engine.supportsExtension(ext)) {
        throw new Error(
          `Engine '${engineName}' does not support .${ext} files`
        );
      }

      if (options.verbose) {
        console.error(`Converting ${absInput} → ${outputPath} (${engineName})`);
      }

      // Ensure output directory exists
      const outDir = path.dirname(outputPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      await engine.convert(absInput, outputPath);
      results.push({ input: absInput, output: outputPath, success: true });

      if (options.verbose) {
        console.error(`  Done: ${outputPath}`);
      }
    } catch (err) {
      results.push({ input: absInput, error: err.message, success: false });
      if (options.verbose) {
        console.error(`  Error: ${err.message}`);
      }
    }
  }

  return results;
}
