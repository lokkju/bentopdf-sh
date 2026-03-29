import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { toPdf } from "./commands/to-pdf.js";
import { toFormat } from "./commands/to-format.js";

async function handleToPdf(argv) {
  try {
    const results = await toPdf(argv.input, {
      output: argv.output,
      engine: argv.engine,
      verbose: argv.verbose,
    });

    const failures = results.filter((r) => !r.success);
    const successes = results.filter((r) => r.success);

    for (const r of successes) {
      console.log(r.output);
    }

    if (failures.length > 0) {
      console.error("");
      for (const f of failures) {
        console.error(`Error: ${f.input}: ${f.error}`);
      }
      if (!argv.verbose) {
        console.error("\nTip: use --verbose for detailed output");
      }
      if (results.length > 1) {
        console.error(
          `\n${successes.length}/${results.length} files converted successfully.`
        );
      }
      process.exit(1);
    }
  } catch (err) {
    // Argument validation errors → exit code 2
    if (err.message.includes("No input files") ||
        err.message.includes("Cannot use a single filename")) {
      console.error(`Error: ${err.message}`);
      process.exit(2);
    }
    // Engine download errors → exit code 3
    if (err.message.includes("download") || err.message.includes("fetch")) {
      console.error(`Error: ${err.message}`);
      process.exit(3);
    }
    // Unknown errors → exit code 1
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

function makeFormatHandler(format) {
  return async function handleToFormat(argv) {
    try {
      const results = await toFormat(argv.input, format, {
        output: argv.output,
        template: argv.template,
        verbose: argv.verbose,
      });

      const failures = results.filter((r) => !r.success);
      const successes = results.filter((r) => r.success);

      for (const r of successes) {
        console.log(r.output);
      }

      if (failures.length > 0) {
        console.error("");
        for (const f of failures) {
          console.error(`Error: ${f.input}: ${f.error}`);
        }
        if (!argv.verbose) {
          console.error("\nTip: use --verbose for detailed output");
        }
        if (results.length > 1) {
          console.error(
            `\n${successes.length}/${results.length} files converted successfully.`
          );
        }
        process.exit(1);
      }
    } catch (err) {
      if (err.message.includes("No input files") ||
          err.message.includes("Cannot use a single filename")) {
        console.error(`Error: ${err.message}`);
        process.exit(2);
      }
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  };
}

async function handleCache(argv) {
  const { Cache } = await import("./cache.js");
  const cache = new Cache();

  switch (argv.action) {
    case "list": {
      const engines = cache.list();
      if (engines.length === 0) {
        console.log("No engines cached.");
      } else {
        for (const e of engines) {
          const sizeMB = (e.size / 1024 / 1024).toFixed(1);
          console.log(`${e.name}@${e.version}  ${sizeMB} MB  ${e.path}`);
        }
      }
      break;
    }
    case "clear":
      cache.clear();
      console.log("Cache cleared.");
      break;
    case "prefetch":
      console.log("Prefetch not yet implemented.");
      break;
  }
}

function formatCommandBuilder(yargs) {
  yargs
    .positional("input", {
      describe: "Input file(s) to convert (Markdown or HTML)",
      type: "string",
      array: true,
    })
    .option("output", {
      alias: "o",
      describe: "Output file or directory",
      type: "string",
    })
    .option("template", {
      alias: "t",
      describe: "Reference document for styling (e.g., a .docx or .pptx template)",
      type: "string",
    })
    .option("verbose", {
      describe: "Show detailed progress",
      type: "boolean",
      default: false,
    });
}

export function buildCli(handlers = {}) {
  const toPdfHandler = handlers.toPdf ?? (() => {});
  const toDocxHandler = handlers.toDocx ?? (() => {});
  const toPptxHandler = handlers.toPptx ?? (() => {});
  const cacheHandler = handlers.cache ?? (() => {});

  return yargs()
    .scriptName("bentopdf")
    .usage("$0 <command> [options]")
    .command(
      "to-pdf <input...>",
      "Convert files to PDF",
      (yargs) => {
        yargs
          .positional("input", {
            describe: "Input file(s) to convert",
            type: "string",
            array: true,
          })
          .option("output", {
            alias: "o",
            describe: "Output file or directory",
            type: "string",
          })
          .option("engine", {
            describe: "Force a specific engine",
            type: "string",
            choices: ["mupdf", "pandoc", "libreoffice"],
          })
          .option("verbose", {
            describe: "Show detailed progress",
            type: "boolean",
            default: false,
          });
      },
      toPdfHandler
    )
    .command(
      "to-docx <input...>",
      "Convert Markdown/HTML to DOCX",
      formatCommandBuilder,
      toDocxHandler
    )
    .command(
      "to-pptx <input...>",
      "Convert Markdown/HTML to PPTX",
      formatCommandBuilder,
      toPptxHandler
    )
    .command(
      "cache <action>",
      "Manage WASM engine cache",
      (yargs) => {
        yargs.positional("action", {
          describe: "Cache action",
          choices: ["list", "clear", "prefetch"],
        });
      },
      cacheHandler
    )
    .demandCommand(1, "Please specify a command")
    .strict()
    .help()
    .version();
}

export async function run(args) {
  await buildCli({
    toPdf: handleToPdf,
    toDocx: makeFormatHandler("docx"),
    toPptx: makeFormatHandler("pptx"),
    cache: handleCache,
  }).parseAsync(args ?? hideBin(process.argv));
}
