import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from "node:fs";
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
  const root = mkdtempSync(join(tmpdir(), "architecture-fixture-")); roots.push(root);
  const content = { "tsconfig.json": JSON.stringify({ compilerOptions: { ...buildTsconfig().compilerOptions, target: "ES2022", module: "ESNext", moduleResolution: "Bundler", ...compilerOptions }, include: ["src/**/*.ts", "src/**/*.tsx"] }), "src/domain/model.ts": "export const value = 1;", ...files };
  for (const [file, text] of Object.entries(content)) { mkdirSync(dirname(join(root, file)), { recursive: true }); writeFileSync(join(root, file), text); }
  return root;
};
const architecture = () => defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },
  files: { otherFiles: ["tsconfig.json", "README.md", "assets/**"] },
  fileTypes: {
    domain: { description: "Domain", files: ["src/domain/**"], imports: { internal: ["domain"] } },
    adapter: { description: "Adapter", files: ["src/adapters/**"], imports: { internal: ["domain"] } },
  },
});
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });

describe("TypeScript project and inventory integration", () => {
  it("uses actual TS membership and checks every other project file", () => {
    const root = fixture({ "src/extra.js": "export const extra = true;", "outside/hidden.ts": "export {};", "surprise.txt": "hello", "README.md": "allowed", ".gitignore": "outside/" });
    const a = architecture(); const opened = openProjects(root, a);
    try {
      expect(opened.issues).toEqual([]);
      const result = inventory(root, a, opened.sources);
      expect(result.files.map((file) => file.relative)).toEqual(["src/domain/model.ts"]);
      expect(result.issues.map((issue) => issue.file)).toEqual(expect.arrayContaining(["src/extra.js", "outside/hidden.ts", "surprise.txt", ".gitignore"]));
    } finally { opened.close(); }
  });
  it("imports bring source outside include patterns under governance", () => {
    const root = fixture({ "src/domain/model.ts": "export { value } from '../../outside.js';", "outside.ts": "export const value = 1;" });
    const a = architecture(); const opened = openProjects(root, a);
    try { expect(inventory(root, a, opened.sources).issues).toContainEqual(expect.objectContaining({ file: "outside.ts", ruleId: "file-classification" })); }
    finally { opened.close(); }
  });
  it("cannot use miscellaneous allowlists to hide TypeScript", () => {
    const root = fixture({ "hidden.ts": "export {};" });
    const a = defineArchitecture({ projects: { tsconfigs: ["tsconfig.json"] }, files: { otherFiles: ["**/*"] }, fileTypes: { source: { description: "Source", files: ["src/**"] } } });
    const opened = openProjects(root, a);
    try { expect(inventory(root, a, opened.sources).issues).toContainEqual(expect.objectContaining({ file: "hidden.ts", ruleId: "project-membership" })); }
    finally { opened.close(); }
  });
  it("rejects symlinks rather than permitting ambiguous identity", () => {
    const root = fixture(); symlinkSync("src/domain/model.ts", join(root, "alias.ts"));
    const a = architecture(); const opened = openProjects(root, a);
    try { expect(inventory(root, a, opened.sources).issues).toContainEqual(expect.objectContaining({ file: "alias.ts", ruleId: "file-inventory" })); }
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
  it("rejects program sources hidden under generated exclusions", () => {
    const root = fixture();
    const a = defineArchitecture({ projects: { tsconfigs: ["tsconfig.json"] }, files: { otherFiles: ["tsconfig.json"], generated: [{ files: ["src/domain/**"], reason: "Invalid attempted exemption" }] }, fileTypes: { app: { description: "app", files: ["src/**"] } } });
    const opened = openProjects(root, a);
    try { expect(inventory(root, a, opened.sources).issues[0]?.message).toContain("cannot hide a source"); }
    finally { opened.close(); }
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
