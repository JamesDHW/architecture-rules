import { describe, expect, it } from "vitest";

import { competingConfiguration, typescriptVersion, unmatchedPatterns, unusedPermissions } from "../src/analysis/configurationChecks.js";
import { analyzeImports } from "../src/analysis/imports.js";
import { inventory } from "../src/analysis/inventory.js";
import { defineArchitecture } from "../src/config/defineArchitecture.js";
import { openFixtureProjects, temporaryRoot, writeFiles } from "./utils/fixtures.js";
import { projectFixture } from "./utils/projectFixture.js";

const configText = `export default defineArchitecture({
  layers: {
    domain: {
      files: ["src/domain/**", "src/old/**"],
      exclude: ["src/domain/**/*.stories.ts"],
      dependencies: { internal: ["domain"], external: ["zod", "node:fs"] },
    },
    adapter: {
      files: ["src/adapters/**"],
      dependencies: { internal: ["domain", "adapter"] },
    },
  },
});`;

const config = { file: "architecture.config.ts", text: configText };

const setup = () => {
  const root = projectFixture({
    "src/domain/model.ts": "import { readFileSync } from 'node:fs'; export const value = readFileSync;",
    "src/adapters/client.ts": "import { value } from '../domain/model.js'; export const client = value;",
  });
  const architecture = defineArchitecture({
    projects: { tsconfigs: ["tsconfig.json"] },
    layers: {
      domain: {
        description: "Domain", files: ["src/domain/**", "src/old/**"], exclude: ["src/domain/**/*.stories.ts"],
        dependencies: { internal: ["domain"], external: ["zod", "node:fs"] },
      },
      adapter: { description: "Adapter", files: ["src/adapters/**"], dependencies: { internal: ["domain", "adapter"] } },
    },
  });
  const opened = openFixtureProjects(root, architecture);
  const { files } = inventory(root, architecture, opened.sources);
  return { root, architecture, opened, files };
};

describe("unusedPermissions", () => {
  it("reports each grant no import from the layer uses, at its line in the configuration", () => {
    const { root, architecture, opened, files } = setup();
    const { uses } = analyzeImports(root, files, opened.projects);
    expect(unusedPermissions(architecture, uses, config).map(({ message, line }) => [message, line])).toEqual([
      ["Layer domain grants internal layer domain, but none of its imports use it.", 6],
      ["Layer domain grants external zod, but none of its imports use it.", 6],
      ["Layer adapter grants internal layer adapter, but none of its imports use it.", 10],
    ]);
  });

  it("points at the layer's own key when a grant is not written in its block", () => {
    const { root, architecture, opened, files } = setup();
    const { uses } = analyzeImports(root, files, opened.projects);
    const spread = { file: config.file, text: configText.replace('external: ["zod", "node:fs"]', "external: [...SHARED]") };
    expect(unusedPermissions(architecture, uses, spread).find(({ message }) => message.includes("zod"))?.line).toBe(3);
  });
});

describe("unmatchedPatterns", () => {
  it("reports file patterns that match no program source, but not exclude patterns, which guard future files", () => {
    const { architecture, files } = setup();
    expect(unmatchedPatterns(architecture, files, config).map(({ message, line }) => [message, line])).toEqual([
      ["Layer domain: files pattern src/old/** matches no source file.", 4],
    ]);
  });

  it("does not report a generated layer whose output is not built yet", () => {
    const architecture = defineArchitecture({
      projects: { tsconfigs: ["tsconfig.json"] },
      layers: { types: { description: "Framework types", files: [".next/types/**/*.ts"], generated: { reason: "Written on build." } } },
    });
    expect(unmatchedPatterns(architecture, [], config)).toEqual([]);
  });
});

describe("competingConfiguration", () => {
  it("reports other linters' and dead-code tools' configuration, but not a formatter-only Biome", () => {
    const root = temporaryRoot("architecture-competing-");
    writeFiles(root, {
      "eslint.config.js": "export default [];",
      "knip.json": "{}",
      "biome.json": JSON.stringify({ linter: { enabled: false } }),
      "package.json": JSON.stringify({ name: "fixture", eslintConfig: {} }),
    });
    expect(competingConfiguration(root).map((issue) => issue.file)).toEqual(["eslint.config.js", "knip.json", "package.json"]);
  });
});

describe("typescriptVersion", () => {
  it("reports a project TypeScript that differs from the checker's", () => {
    const root = temporaryRoot("architecture-typescript-");
    writeFiles(root, { "node_modules/typescript/package.json": JSON.stringify({ name: "typescript", version: "5.9.3" }) });
    expect(typescriptVersion(root, "7.0.2")).toEqual([expect.objectContaining({ ruleId: "typescript-version", file: "package.json" })]);
    expect(typescriptVersion(root, "5.9.3")).toEqual([]);
    expect(typescriptVersion(temporaryRoot("architecture-no-typescript-"), "7.0.2")).toEqual([]);
  });
});
