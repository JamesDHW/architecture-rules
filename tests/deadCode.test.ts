import { describe, expect, it } from "vitest";

import { inventory } from "../src/analysis/inventory.js";
import { defineArchitecture } from "../src/config/defineArchitecture.js";
import type { ProjectRules } from "../src/config/types.js";
import { deadCode } from "../src/runner/deadCode.js";
import { openFixtureProjects, temporaryRoot, tsconfigJson, writeFiles } from "./utils/fixtures.js";

const fixture = (rules: ProjectRules = {}) => {
  const root = temporaryRoot("architecture-dead-code-");
  writeFiles(root, {
    "package.json": JSON.stringify({ name: "fixture", private: true, type: "module", dependencies: { "left-pad": "1.0.0" } }),
    "tsconfig.json": tsconfigJson({ target: "ES2022", module: "ESNext", moduleResolution: "Bundler" }, { include: ["src/**/*.ts", "tests/**/*.ts"] }),
    "src/main.ts": "import { helper } from './domain/helper.js';\nexport const started = helper();\n",
    "src/domain/helper.ts": "export const helper = (): number => 1;\nexport const unusedHelper = (): number => 2;\nexport type Unused = string;\n",
    "src/domain/testOnly.ts": "export const testOnly = 3;\n",
    "src/domain/dead.ts": "export const dead = 4;\n",
    "src/routes/about.ts": "export const Route = 'about';\nexport const extra = 1;\n",
    "src/index.ts": "export { helper } from './domain/helper.js';\n",
    "tests/helper.test.ts": "import { testOnly } from '../src/domain/testOnly.js';\nexport const checked = testOnly;\n",
  });
  const architecture = defineArchitecture({
    projects: { tsconfigs: ["tsconfig.json"] },
    rules,
    layers: {
      app: { description: "App", files: ["src/main.ts"], entry: { reason: "The bundler starts here." } },
      domain: { description: "Domain", files: ["src/domain/**"] },
      route: { description: "Routes", files: ["src/routes/**"], entry: { reason: "The router loads routes.", exports: ["Route"] } },
      api: { description: "API", files: ["src/index.ts"], entry: { reason: "Package entry.", exports: "all" } },
      tests: { description: "Tests", files: ["tests/**"], entry: { reason: "The runner loads tests.", exports: ["checked"] }, development: true },
    },
  });
  const opened = openFixtureProjects(root, architecture);
  return { root, architecture, files: inventory(root, architecture, opened.sources).files };
};

const summary = (findings: readonly { readonly ruleId: string; readonly file: string; readonly message: string }[]) => {
  return findings.map(({ ruleId, file, message }) => `${ruleId} ${file}: ${message}`).toSorted();
};

describe("dead-code stage", () => {
  // main.ts is an entry that names no used exports, so its export counts as unused: being loaded is not being imported.
  it("reports unused files, exports, types and dependencies from the layers' entries", async () => {
    const { root, architecture, files } = fixture();
    const findings = await deadCode(root, architecture, files, "architecture.config.ts");
    if (findings instanceof Error) return expect.unreachable(findings.message);
    expect(summary(findings)).toEqual([
      "production-reachability src/domain/testOnly.ts: This file is used only by development layers (tests, tooling), not by production code.",
      "unused-dependencies package.json: `left-pad` is declared in package.json, but nothing uses it.",
      "unused-exports src/domain/helper.ts: `unusedHelper` is exported, but nothing imports it.",
      "unused-exports src/main.ts: `started` is exported, but nothing imports it.",
      "unused-exports src/routes/about.ts: `extra` is exported, but nothing imports it.",
      "unused-files src/domain/dead.ts: Nothing imports this file, and its layer is not an entry.",
      "unused-types src/domain/helper.ts: Type `Unused` is exported, but nothing imports it.",
    ]);
  });

  it("honours allow lists and severities, and reports an allowance nothing needs", async () => {
    const { root, architecture, files } = fixture({
      "unused-dependencies": { options: { allow: ["left-pad", "sharp"] }, reason: "Loaded at runtime." },
      "unused-files": "off",
      "unused-types": { severity: "warn", reason: "Migrating." },
    });
    const findings = await deadCode(root, architecture, files, "architecture.config.ts");
    if (findings instanceof Error) return expect.unreachable(findings.message);
    expect(findings.some((finding) => finding.ruleId === "unused-files")).toBe(false);
    expect(findings.find((finding) => finding.ruleId === "unused-types")?.severity).toBe("warning");
    expect(summary(findings.filter((finding) => finding.ruleId === "unused-dependencies"))).toEqual([
      "unused-dependencies architecture.config.ts: unused-dependencies allows sharp, but nothing needs that allowance. Remove it.",
    ]);
  });

  it("names no tool in its findings", async () => {
    const { root, architecture, files } = fixture();
    const findings = await deadCode(root, architecture, files, "architecture.config.ts");
    if (findings instanceof Error) return expect.unreachable(findings.message);
    expect(findings.map((finding) => finding.message.toLowerCase()).join(" ")).not.toMatch(/knip|oxlint/);
  });
});
