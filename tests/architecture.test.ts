import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "..");

function tsFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? tsFiles(p) : e.name.endsWith(".ts") ? [p] : [];
  });
}

export function stripCommentsAndStrings(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ")
    .replace(/`(?:[^`\\]|\\.)*`/g, " ")
    .replace(/"(?:[^"\\]|\\.)*"/g, " ")
    .replace(/'(?:[^'\\]|\\.)*'/g, " ");
}

const simFiles = tsFiles(join(root, "src/sim"));
const dataFiles = tsFiles(join(root, "src/data"));
const scoped = [...simFiles, ...dataFiles];
const UI_IMPORT = /["'][^"']*(?:^|\/)ui(?:\/[^"']*)?["']/;
const BROWSER_GLOBAL = /\b(?:document|window|localStorage)\b/;

describe("architecture boundaries", () => {
  it("found sim and data files to check", () => {
    expect(simFiles.length).toBeGreaterThan(10);
    expect(dataFiles.length).toBeGreaterThan(2);
  });

  it("src/sim and src/data never import from src/ui", () => {
    const violations = scoped.filter((f) => UI_IMPORT.test(readFileSync(f, "utf8")));
    expect(violations.map((f) => relative(root, f))).toEqual([]);
  });

  it("sim modules other than save.ts reference no browser globals", () => {
    const violations = simFiles
      .filter((f) => !f.endsWith("save.ts"))
      .filter((f) => BROWSER_GLOBAL.test(stripCommentsAndStrings(readFileSync(f, "utf8"))));
    expect(violations.map((f) => relative(root, f))).toEqual([]);
  });

  it("save.ts is the only persistence adapter using localStorage", () => {
    expect(readFileSync(join(root, "src/sim/save.ts"), "utf8")).toMatch(BROWSER_GLOBAL);
  });
});
