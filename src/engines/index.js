import { MuPdfEngine } from "./mupdf.js";
import { PandocEngine } from "./pandoc.js";
import { LibreOfficeEngine } from "./libreoffice.js";

const instances = new Map();

export function getEngine(name) {
  if (instances.has(name)) return instances.get(name);

  let engine;
  switch (name) {
    case "mupdf":
      engine = new MuPdfEngine();
      break;
    case "pandoc":
      engine = new PandocEngine();
      break;
    case "libreoffice":
      engine = new LibreOfficeEngine();
      break;
    default:
      throw new Error(`Unknown engine: ${name}`);
  }

  instances.set(name, engine);
  return engine;
}
