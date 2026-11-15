import { describe, expect, it } from "vitest";

import { analyzeImports } from "../src/analysis/imports.js";
import { inventory } from "../src/analysis/inventory.js";
import { isPublicExport, publicExports } from "../src/analysis/publicExports.js";
import { workspaceOf, workspacesOf } from "../src/analysis/workspaces.js";
import { defineArchitecture } from "../src/config/defineArchitecture.js";
import { deadCode } from "../src/runner/deadCode.js";
import { openFixtureProjects, temporaryRoot, tsconfigJson, writeFiles } from "./utils/fixtures.js";
import { projectFixture } from "./utils/projectFixture.js";

const monorepo = () => {
  const root = temporaryRoot("architecture-monorepo-");
  writeFiles(root, {
    "package.json": JSON.stringify({ name: "root", private: true, type: "module" }),
    "pnpm-workspace.yaml": "packages:\n  - apps/*\n  - 'packages/*'\nother: true\n",
    "tsconfig.json": tsconfigJson({ target: "ES2022", module: "ESNext", moduleResolution: "Bundler", allowImportingTsExtensions: true, noEmit: true }, {
      include: ["apps/**/*.ts", "packages/**/*.ts", "scripts/**/*.ts", "architecture.config.ts"],
    }),
    "architecture.config.ts": "export default {};\n",
    "packages/lib/package.json": JSON.stringify({ name: "@fixture/lib", private: true, type: "module", exports: { "./*": "./src/*.ts" } }),
    "packages/lib/src/util.ts": "export const used = (): number => 1;\nexport const unused = (): number => 2;\n",
    "apps/app/package.json": JSON.stringify({ name: "app", private: true, type: "module" }),
    "apps/app/src/main.ts": "import { used } from '../../../packages/lib/src/util.ts';\nconsole.log(used());\n",
    "scripts/package.json": JSON.stringify({ type: "module" }),
    "scripts/run.ts": "console.log('run');\n",
  });
  const architecture = defineArchitecture({
    projects: { tsconfigs: ["tsconfig.json"] },
    layers: {
      lib: { description: "Library", files: ["packages/lib/src/**"] },
      app: { description: "App", files: ["apps/app/src/**"], entry: { reason: "The app starts here." } },
      script: { description: "Scripts", files: ["scripts/**"], entry: { reason: "package.json scripts run these." } },
      tooling: { description: "Configuration", files: ["architecture.config.ts"], development: true },
    },
  });
  const opened = openFixtureProjects(root, architecture);
  return { root, architecture, opened, files: inventory(root, architecture, opened.sources).files };
};

describe("workspaces", () => {
  it("finds the workspace packages the root's patterns select, not every directory with a package.json", () => {
    const { root, files } = monorepo();
    const workspaces = workspacesOf(root, files);
    expect(workspaces.toSorted()).toEqual(["apps/app", "packages/lib"]);
    expect(workspaceOf(workspaces, "packages/lib/src/util.ts")).toBe("packages/lib");
    expect(workspaceOf(workspaces, "scripts/run.ts")).toBe(".");
  });
});

describe("dead code in a monorepo", () => {
  it("applies the layers' entries inside each workspace, counts a package's exports only when imported, and keeps the configuration file", async () => {
    const { root, architecture, opened, files } = monorepo();
    const findings = await deadCode(root, { architecture, files, projects: opened.projects, configFile: "architecture.config.ts" });
    if (findings instanceof Error) return expect.unreachable(findings.message);
    expect(findings.map(({ ruleId, file, message }) => `${ruleId} ${file}: ${message}`)).toEqual([
      "unused-exports packages/lib/src/util.ts: `unused` is exported, but nothing imports it.",
    ]);
  });
});

describe("public exports", () => {
  it("follows an entry's re-exports to where each public value is declared", () => {
    const root = projectFixture({
      "src/index.ts": "export { helper as publicHelper } from './domain/helper.js';\nexport * from './domain/other.js';\nexport * as tools from './domain/tools.js';\n",
      "src/domain/helper.ts": "export const helper = (): number => 1;\nexport const internal = 2;\n",
      "src/domain/other.ts": "export const other = 3;\n",
      "src/domain/tools.ts": "export const tool = 4;\n",
    });
    const architecture = defineArchitecture({
      projects: { tsconfigs: ["tsconfig.json"] },
      layers: {
        api: { description: "API", files: ["src/index.ts"], entry: { reason: "Package entry.", exports: "all" } },
        domain: { description: "Domain", files: ["src/domain/**"] },
      },
    });
    const opened = openFixtureProjects(root, architecture);
    const exports = publicExports(inventory(root, architecture, opened.sources).files, opened.projects);
    expect(isPublicExport(exports, "src/domain/helper.ts", "helper")).toBe(true);
    expect(isPublicExport(exports, "src/domain/helper.ts", "internal")).toBe(false);
    expect(isPublicExport(exports, "src/domain/other.ts", "other")).toBe(true);
    expect(isPublicExport(exports, "src/domain/tools.ts", "tool")).toBe(true);
  });
});

describe("JSX runtime", () => {
  it("counts the runtime JSX compiles to as a use of the layer's grant", () => {
    const root = projectFixture({ "src/domain/view.tsx": "export const View = () => <div />;\n" }, { jsx: "react-jsx" });
    const architecture = defineArchitecture({
      projects: { tsconfigs: ["tsconfig.json"] },
      layers: { domain: { description: "Domain", files: ["src/domain/**"], dependencies: { external: ["react/jsx-runtime"] } } },
    });
    const opened = openFixtureProjects(root, architecture);
    const { uses } = analyzeImports(root, inventory(root, architecture, opened.sources).files, opened.projects);
    expect(uses).toContainEqual({ layer: "domain", kind: "external", value: "react/jsx-runtime" });
  });
});
