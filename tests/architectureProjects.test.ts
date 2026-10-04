import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { defineArchitecture } from "../src/core/defineArchitecture.js";
import { buildTsconfig } from "../src/generateTsconfig.js";
import { inventory } from "../src/architecture/inventory.js";
import { openProjects } from "../src/architecture/projects.js";
import { checkSuppressions } from "../src/architecture/suppressions.js";
import { checkImports } from "../src/architecture/imports.js";

const roots: string[] = [];
const fixture = (files: Record<string, string> = {}, compilerOptions: Record<string, unknown> = {}) => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "architecture-fixture-"))); roots.push(root);
  const content = { "tsconfig.json": JSON.stringify({ compilerOptions: { ...buildTsconfig().compilerOptions, target: "ES2022", module: "ESNext", moduleResolution: "Bundler", ...compilerOptions }, include: ["src/**/*.ts", "src/**/*.tsx"] }), "src/domain/model.ts": "export const value = 1;", ...files };
  for (const [file, text] of Object.entries(content)) { mkdirSync(dirname(join(root, file)), { recursive: true }); writeFileSync(join(root, file), text); }
  return root;
};
const architecture = () => defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },
  fileTypes: {
    domain: { description: "Domain", files: ["src/domain/**"], imports: { internal: ["domain"] } },
    adapter: { description: "Adapter", files: ["src/adapters/**"], imports: { internal: ["domain"] } },
  },
});
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });

describe("TypeScript project and inventory integration", () => {
  it("ignores unrelated source, assets, configuration and auxiliary files", () => {
    const root = fixture({ "src/extra.js": "export const extra = true;", "outside/hidden.ts": "export {};", "surprise.txt": "hello", "README.md": "allowed", ".gitignore": "outside/" });
    const a = architecture(); const opened = openProjects(root, a);
    try {
      expect(opened.issues).toEqual([]);
      const result = inventory(root, a, opened.sources);
      expect(result.files.map((file) => file.relative)).toEqual(["src/domain/model.ts"]);
      expect(result.issues).toEqual([]);
    } finally { opened.close(); }
  });
  it("imports bring source outside include patterns under governance", () => {
    const root = fixture({ "src/domain/model.ts": "export { value } from '../../outside.js';", "outside.ts": "export const value = 1;" });
    const a = architecture(); const opened = openProjects(root, a);
    try { expect(inventory(root, a, opened.sources).issues).toContainEqual(expect.objectContaining({ file: "outside.ts", ruleId: "file-classification" })); }
    finally { opened.close(); }
  });
  it("ignores symlinks outside the compiler program", () => {
    const root = fixture(); symlinkSync("src/domain/model.ts", join(root, "alias.ts"));
    const a = architecture(); const opened = openProjects(root, a);
    try { expect(inventory(root, a, opened.sources).issues).toEqual([]); }
    finally { opened.close(); }
  });
  it("rejects selected symlinks rather than permitting ambiguous identity", () => {
    const root = fixture(); symlinkSync("model.ts", join(root, "src/domain/alias.ts"));
    const a = architecture(); const opened = openProjects(root, a);
    try { expect([...opened.issues, ...inventory(root, a, opened.sources).issues]).toContainEqual(expect.objectContaining({ ruleId: "project-membership" })); }
    finally { opened.close(); }
  });
  it.each([false, true])("respects allowJs=%s with TypeScript directory includes", (allowJs) => {
    const root = fixture({
      "tsconfig.json": JSON.stringify({ compilerOptions: { ...buildTsconfig().compilerOptions, allowJs }, include: ["src"] }),
      "src/domain/extra.js": "export const js = 1;",
    });
    const a = architecture(); const opened = openProjects(root, a);
    try {
      expect(opened.sources.has(join(root, "src/domain/extra.js"))).toBe(allowJs);
      expect(inventory(root, a, opened.sources).issues).toEqual([]);
    } finally { opened.close(); }
  });
  it("respects files-only configurations even if an explicit file is also excluded", () => {
    const root = fixture({
      "tsconfig.json": JSON.stringify({ compilerOptions: buildTsconfig().compilerOptions, files: ["src/domain/explicit.ts"], include: [], exclude: ["src/domain/explicit.ts"] }),
      "src/domain/explicit.ts": "export {};",
    });
    const a = architecture(); const opened = openProjects(root, a);
    try { expect(inventory(root, a, opened.sources).files.map(file => file.relative)).toEqual(["src/domain/explicit.ts"]); }
    finally { opened.close(); }
  });
  it("resolves inherited include/exclude relative to the config declaring them", () => {
    const root = fixture({
      "tsconfig.json": JSON.stringify({ extends: "./config/base.json" }),
      "config/base.json": JSON.stringify({ compilerOptions: buildTsconfig().compilerOptions, include: ["../src"], exclude: ["../src/excluded"] }),
      "src/excluded/ignored.ts": "export {};",
    });
    const a = architecture(); const opened = openProjects(root, a);
    try { expect(inventory(root, a, opened.sources).files.map(file => file.relative)).toEqual(["src/domain/model.ts"]); }
    finally { opened.close(); }
  });
  it("does not apply one project's exclusions to another project's sources", () => {
    const root = fixture({
      "tsconfig.a.json": JSON.stringify({ compilerOptions: buildTsconfig().compilerOptions, include: ["src"], exclude: ["src/domain/shared.ts"] }),
      "tsconfig.b.json": JSON.stringify({ compilerOptions: buildTsconfig().compilerOptions, files: ["src/domain/shared.ts"] }),
      "src/domain/shared.ts": "export {};",
    });
    const a = defineArchitecture({ projects: { tsconfigs: ["tsconfig.a.json", "tsconfig.b.json"] }, fileTypes: { app: { description: "App", files: ["src/**"] } } });
    const opened = openProjects(root, a);
    try { expect(inventory(root, a, opened.sources).files.map(file => file.relative)).toContain("src/domain/shared.ts"); }
    finally { opened.close(); }
  });
  it("does not silently exempt an architecture config selected by TypeScript", () => {
    const root = fixture({
      "tsconfig.json": JSON.stringify({ compilerOptions: buildTsconfig().compilerOptions, files: ["architecture.config.ts"] }),
      "architecture.config.ts": "export {};",
    });
    const a = architecture(); const opened = openProjects(root, a);
    try { expect(inventory(root, a, opened.sources).issues).toContainEqual(expect.objectContaining({ file: "architecture.config.ts", ruleId: "file-classification" })); }
    finally { opened.close(); }
  });
  it("reports weakened effective flags and strict subflags", () => {
    const root = fixture({}, { strictNullChecks: false, noUncheckedIndexedAccess: false });
    const opened = openProjects(root, architecture());
    try { expect(opened.issues.map((issue) => issue.ruleId)).toEqual(expect.arrayContaining(["strict-typescript", "checked-indexed-access"])); }
    finally { opened.close(); }
  });
  it("resolves aliases and .js specifiers against actual target roles", () => {
    const root = fixture({
      "src/domain/model.ts": "import { connection } from '@adapters/client'; export { connection };",
      "src/adapters/client.ts": "export const connection = 1;",
    }, { paths: { "@adapters/*": ["./src/adapters/*"] } });
    const a = architecture(); const opened = openProjects(root, a);
    try {
      const tree = inventory(root, a, opened.sources);
      expect(tree.issues).toEqual([]);
      expect(checkImports(root, tree.files, opened.projects)).toContainEqual(expect.objectContaining({ file: "src/domain/model.ts", message: expect.stringContaining("may not import adapter") }));
    } finally { opened.close(); }
  });
  it("checks re-exports, import types, and nonliteral dynamic imports", () => {
    const root = fixture({
      "src/domain/model.ts": "export { client } from '../adapters/client.js';\ntype Client = import('../adapters/client.js').Client;\nexport const load = (name: string) => import(name);",
      "src/adapters/client.ts": "export const client = 1; export type Client = number;",
    });
    const a = architecture(); const opened = openProjects(root, a);
    try {
      const messages = checkImports(root, inventory(root, a, opened.sources).files, opened.projects);
      expect(messages).toHaveLength(3);
      expect(messages.map((issue) => issue.line)).toEqual([1, 2, 3]);
    } finally { opened.close(); }
  });
  it("follows references from solution configurations", () => {
    const root = fixture({ "tsconfig.json": JSON.stringify({ files: [], references: [{ path: "./lib" }] }), "lib/tsconfig.json": JSON.stringify({ compilerOptions: { ...buildTsconfig().compilerOptions, composite: true }, files: ["entry.ts"] }), "lib/entry.ts": "export const lib = 1;" });
    const a = architecture(); const opened = openProjects(root, a);
    try { expect(opened.projects.map((project) => project.configFileName)).toContain(join(root, "lib/tsconfig.json")); }
    finally { opened.close(); }
  });
  it("does not confuse comment-like strings with suppression directives", () => {
    const root = fixture({ "src/domain/model.ts": `export const text = "// oxlint-disable";
// oxlint-disable-next-line architecture/no-binding-alias -- Required public compatibility name.
export const other = text;` });
    const a = architecture(); const opened = openProjects(root, a);
    try { expect(checkSuppressions(inventory(root, a, opened.sources).files, opened.projects)).toEqual([]); }
    finally { opened.close(); }
  });
  it("rejects missing reasons and inline severity reconfiguration", () => {
    const root = fixture({ "src/domain/model.ts": `// oxlint-disable-next-line architecture/no-binding-alias
export const value = 1;
/* eslint architecture/no-binding-alias: off */
export const other = value;` });
    const a = architecture(); const opened = openProjects(root, a);
    try { expect(checkSuppressions(inventory(root, a, opened.sources).files, opened.projects)).toHaveLength(2); }
    finally { opened.close(); }
  });
  it("checks built-ins without requiring local @types packages", () => {
    const root = fixture({ "src/domain/model.ts": "import fs from 'node:fs'; export { fs };" });
    const a = architecture(); const opened = openProjects(root, a);
    try { expect(checkImports(root, inventory(root, a, opened.sources).files, opened.projects)[0]?.message).toContain("Built-in import is not permitted"); }
    finally { opened.close(); }
  });
  it("keeps imports of excluded/generated source in scope, as TypeScript does", () => {
    const root = fixture({
      "tsconfig.json": JSON.stringify({ compilerOptions: { ...buildTsconfig().compilerOptions, module: "ESNext", moduleResolution: "Bundler" }, include: ["src"], exclude: ["src/generated/**"] }),
      "src/domain/model.ts": "export { value } from '../generated/model';",
      "src/generated/model.ts": "export const value = 1;",
      "src/generated/unreferenced.ts": "export {};",
    });
    const a = architecture(); const opened = openProjects(root, a);
    try {
      expect(opened.sources.has(join(root, "src/generated/model.ts"))).toBe(true);
      expect(opened.sources.has(join(root, "src/generated/unreferenced.ts"))).toBe(false);
      expect(inventory(root, a, opened.sources).issues).toContainEqual(expect.objectContaining({ file: "src/generated/model.ts", ruleId: "file-classification" }));
    } finally { opened.close(); }
  });

  it("ignores directive-like JSX text but validates actual JSX comments", () => {
    const root = fixture({ "src/domain/view.tsx": `export const View = () => <div>// oxlint-disable
<span />// eslint-disable
{/* oxlint-disable */}
</div>;` }, { jsx: "preserve" });
    const a = architecture(); const opened = openProjects(root, a);
    try {
      const issues = checkSuppressions(inventory(root, a, opened.sources).files, opened.projects);
      expect(issues).toHaveLength(1);
      expect(issues[0]?.line).toBe(3);
    } finally { opened.close(); }
  });

});
