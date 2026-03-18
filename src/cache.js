import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

export class Cache {
  constructor(baseDir) {
    this.baseDir = baseDir ?? path.join(
      process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache"),
      "bentopdf"
    );
  }

  enginePath(name, version) {
    return path.join(this.baseDir, "engines", name, version);
  }

  isCached(name, version) {
    const p = this.enginePath(name, version);
    return fs.existsSync(path.join(p, ".complete"));
  }

  markComplete(name, version) {
    const p = this.enginePath(name, version);
    fs.writeFileSync(path.join(p, ".complete"), "");
  }

  list() {
    const enginesDir = path.join(this.baseDir, "engines");
    if (!fs.existsSync(enginesDir)) return [];

    const results = [];
    for (const name of fs.readdirSync(enginesDir)) {
      const engineDir = path.join(enginesDir, name);
      if (!fs.statSync(engineDir).isDirectory()) continue;
      for (const version of fs.readdirSync(engineDir)) {
        const versionDir = path.join(engineDir, version);
        if (!fs.statSync(versionDir).isDirectory()) continue;
        if (fs.existsSync(path.join(versionDir, ".complete"))) {
          const size = this._dirSize(versionDir);
          results.push({ name, version, path: versionDir, size });
        }
      }
    }
    return results;
  }

  clear() {
    const enginesDir = path.join(this.baseDir, "engines");
    if (fs.existsSync(enginesDir)) {
      fs.rmSync(enginesDir, { recursive: true, force: true });
    }
  }

  _dirSize(dir) {
    let total = 0;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        total += this._dirSize(fullPath);
      } else {
        total += fs.statSync(fullPath).size;
      }
    }
    return total;
  }
}
