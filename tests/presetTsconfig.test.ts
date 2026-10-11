import { mkdirSync, symlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { defineArchitecture } from "../src/config/defineArchitecture.js";
import { rules } from "../src/rules/index.js";
import { openFixtureProjects, temporaryRoot, writeFiles } from "./utils/fixtures.js";
import { presetCompilerOptions, readPreset } from "./utils/preset.js";

const requiredCompilerOptions = Object.fromEntries(rules.flatMap(({ enforcement }) => {
  return enforcement.type === "typescript" ? Object.entries(enforcement.compilerOptions) : [];
}));

/** A project that installs this package and extends its preset through the given specifier. */
const consumerExtending = (specifier: string): string => {
  const root = temporaryRoot("architecture-preset-");
  mkdirSync(join(root, "node_modules"));
  symlinkSync(resolve("."), join(root, "node_modules", "architecture-rules"));
  writeFiles(root, {
    "tsconfig.json": JSON.stringify({ extends: specifier, compilerOptions: { module: "ESNext", moduleResolution: "Bundler", noEmit: true }, include: ["src"] }),
    "src/model.ts": "export const value = 1;",
  });
  return root;
};

describe("presets/tsconfig.json", () => {
  it("sets exactly the compiler options the TypeScript rules require", () => {
    expect(presetCompilerOptions()).toEqual(requiredCompilerOptions);
  });

  it("leaves module, target, JSX and file selection to the consuming project", () => {
    expect(Object.keys(readPreset()).toSorted()).toEqual(["$schema", "compilerOptions"]);
  });

  it.each(["architecture-rules/tsconfig", "architecture-rules/presets/tsconfig.json"])("meets every compiler requirement when a project extends %s", (specifier) => {
    const root = consumerExtending(specifier);
    const architecture = defineArchitecture({ projects: { tsconfigs: ["tsconfig.json"] }, layers: { app: { description: "App", files: ["src/**"] } } });
    expect(openFixtureProjects(root, architecture).issues).toEqual([]);
  });
});
