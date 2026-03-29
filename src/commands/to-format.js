import * as fs from "node:fs";
import * as path from "node:path";
import { PandocEngine } from "../engines/pandoc.js";

const SUPPORTED_INPUTS = ["md", "markdown", "html", "htm"];

export function resolveOutputPath(inputPath, outputArg, toFormat) {
  if (!outputArg) {
    const dir = path.dirname(inputPath);
    const base = path.basename(inputPath, path.extname(inputPath));
    return path.join(dir, `${base}.${toFormat}`);
  }

  const isDir = outputArg.endsWith(path.sep) || outputArg.endsWith("/") ||
    (fs.existsSync(outputArg) && fs.statSync(outputArg).isDirectory());

  if (isDir) {
    const base = path.basename(inputPath, path.extname(inputPath));
    return path.join(outputArg, `${base}.${toFormat}`);
  }

  return outputArg;
}

export function validateArgs(inputs, output) {
  if (inputs.length === 0) {
    throw new Error("No input files provided");
  }

  if (inputs.length > 1 && output && !output.endsWith(path.sep) && !output.endsWith("/")) {
    if (!fs.existsSync(output) || !fs.statSync(output).isDirectory()) {
      throw new Error(
        "Cannot use a single filename as output for multiple inputs. " +
        "Use a directory path (ending with /) instead."
      );
    }
  }
}

export async function toFormat(inputs, toFormat, options = {}) {
  validateArgs(inputs, options.output);

  const engine = new PandocEngine();
  const results = [];

  for (const inputPath of inputs) {
    const absInput = path.resolve(inputPath);
    const outputPath = resolveOutputPath(absInput, options.output, toFormat);

    try {
      if (!fs.existsSync(absInput)) {
        throw new Error(`File not found: ${absInput}`);
      }

      const ext = path.extname(absInput).slice(1).toLowerCase();
      if (!SUPPORTED_INPUTS.includes(ext)) {
        throw new Error(
          `Unsupported input format: .${ext}\nSupported: ${SUPPORTED_INPUTS.join(", ")}`
        );
      }

      if (options.verbose) {
        console.error(`Converting ${absInput} → ${outputPath} (pandoc → ${toFormat})`);
      }

      const outDir = path.dirname(outputPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      await engine.convertTo(absInput, outputPath, {
        toFormat,
        template: options.template,
      });

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
