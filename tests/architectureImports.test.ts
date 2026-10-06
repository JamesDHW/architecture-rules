import { describe, expect, it } from "vitest";

import { checkImports } from "../src/analysis/imports.js";
import { inventory } from "../src/analysis/inventory.js";
import { checkSuppressions } from "../src/analysis/suppressions.js";
import { openFixtureProjects } from "./utils/fixtures.js";
import { projectFixture, twoLayerArchitecture } from "./utils/projectFixture.js";

describe("Import and suppression checks on TypeScript programs", () => {
  it("resolves aliases and .js specifiers against actual target roles", () => {
    const root = projectFixture({
      "src/domain/model.ts": "import { connection } from '@adapters/client'; export { connection };",
      "src/adapters/client.ts": "export const connection = 1;",
    }, { paths: { "@adapters/*": ["./src/adapters/*"] } });
    const a = twoLayerArchitecture(); const opened = openFixtureProjects(root, a);
    const tree = inventory(root, a, opened.sources);
    expect(tree.issues).toEqual([]);
    const modelIssues = checkImports(root, tree.files, opened.projects).filter((issue) => issue.file === "src/domain/model.ts");
    expect(modelIssues.map((issue) => issue.message)).toContainEqual("File type domain may not import adapter: src/adapters/client.ts");
  });
  it("checks re-exports, import types, and nonliteral dynamic imports", () => {
    const root = projectFixture({
      "src/domain/model.ts": "export { client } from '../adapters/client.js';\ntype Client = import('../adapters/client.js').Client;\nexport const load = (name: string) => import(name);",
      "src/adapters/client.ts": "export const client = 1; export type Client = number;",
    });
    const a = twoLayerArchitecture(); const opened = openFixtureProjects(root, a);
    const messages = checkImports(root, inventory(root, a, opened.sources).files, opened.projects);
    expect(messages).toHaveLength(3);
    expect(messages.map((issue) => issue.line)).toEqual([1, 2, 3]);
  });
  it("does not confuse comment-like strings with suppression directives", () => {
    const root = projectFixture({ "src/domain/model.ts": `export const text = "// oxlint-disable";
// oxlint-disable-next-line architecture/no-binding-alias -- Required public compatibility name.
export const other = text;` });
    const a = twoLayerArchitecture(); const opened = openFixtureProjects(root, a);
    expect(checkSuppressions(inventory(root, a, opened.sources).files, opened.projects)).toEqual([]);
  });
  it("rejects missing reasons and inline severity reconfiguration", () => {
    const root = projectFixture({ "src/domain/model.ts": `// oxlint-disable-next-line architecture/no-binding-alias
export const value = 1;
/* eslint architecture/no-binding-alias: off */
export const other = value;` });
    const a = twoLayerArchitecture(); const opened = openFixtureProjects(root, a);
    expect(checkSuppressions(inventory(root, a, opened.sources).files, opened.projects)).toHaveLength(2);
  });
  it("checks built-ins without requiring local @types packages", () => {
    const root = projectFixture({ "src/domain/model.ts": "import fs from 'node:fs'; export { fs };" });
    const a = twoLayerArchitecture(); const opened = openFixtureProjects(root, a);
    expect(checkImports(root, inventory(root, a, opened.sources).files, opened.projects)[0]?.message).toContain("Built-in import is not permitted");
  });
  it("ignores directive-like JSX text but validates actual JSX comments", () => {
    const root = projectFixture({ "src/domain/view.tsx": `export const View = () => <div>// oxlint-disable
<span />// eslint-disable
{/* oxlint-disable */}
</div>;` }, { jsx: "preserve" });
    const a = twoLayerArchitecture(); const opened = openFixtureProjects(root, a);
    const issues = checkSuppressions(inventory(root, a, opened.sources).files, opened.projects);
    expect(issues).toHaveLength(1);
    expect(issues[0]?.line).toBe(3);
  });
});
