import { symlinkSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { inventory } from "../src/analysis/inventory.js";
import { defineArchitecture } from "../src/config/defineArchitecture.js";
import { openFixtureProjects } from "./utils/fixtures.js";
import { projectFixture, requiredOptions, twoLayerArchitecture } from "./utils/projectFixture.js";

describe("TypeScript project and inventory integration", () => {
  it("ignores unrelated source, assets, configuration and auxiliary files", () => {
    const root = projectFixture({ "src/extra.js": "export const extra = true;", "outside/hidden.ts": "export {};", "surprise.txt": "hello", "README.md": "allowed", ".gitignore": "outside/" });
    const a = twoLayerArchitecture(); const opened = openFixtureProjects(root, a);
    expect(opened.issues).toEqual([]);
    const result = inventory(root, a, opened.sources);
    expect(result.files.map((file) => file.relative)).toEqual(["src/domain/model.ts"]);
    expect(result.issues).toEqual([]);
  });
  it("imports bring source outside include patterns under governance", () => {
    const root = projectFixture({ "src/domain/model.ts": "export { value } from '../../outside.js';", "outside.ts": "export const value = 1;" });
    const a = twoLayerArchitecture(); const opened = openFixtureProjects(root, a);
    expect(inventory(root, a, opened.sources).issues).toContainEqual(expect.objectContaining({ file: "outside.ts", ruleId: "file-classification" }));
  });
  it("ignores symlinks outside the compiler program", () => {
    const root = projectFixture(); symlinkSync("src/domain/model.ts", join(root, "alias.ts"));
    const a = twoLayerArchitecture(); const opened = openFixtureProjects(root, a);
    expect(inventory(root, a, opened.sources).issues).toEqual([]);
  });
  it("rejects selected symlinks rather than permitting ambiguous identity", () => {
    const root = projectFixture(); symlinkSync("model.ts", join(root, "src/domain/alias.ts"));
    const a = twoLayerArchitecture(); const opened = openFixtureProjects(root, a);
    expect([...opened.issues, ...inventory(root, a, opened.sources).issues]).toContainEqual(expect.objectContaining({ ruleId: "project-membership" }));
  });
  it.each([false, true])("respects allowJs=%s with TypeScript directory includes", (allowJs) => {
    const root = projectFixture({
      "tsconfig.json": JSON.stringify({ compilerOptions: { ...requiredOptions, allowJs }, include: ["src"] }),
      "src/domain/extra.js": "export const js = 1;",
    });
    const a = twoLayerArchitecture(); const opened = openFixtureProjects(root, a);
    expect(opened.sources.has(join(root, "src/domain/extra.js"))).toBe(allowJs);
    expect(inventory(root, a, opened.sources).issues).toEqual([]);
  });
  it("respects files-only configurations even if an explicit file is also excluded", () => {
    const root = projectFixture({
      "tsconfig.json": JSON.stringify({ compilerOptions: requiredOptions, files: ["src/domain/explicit.ts"], include: [], exclude: ["src/domain/explicit.ts"] }),
      "src/domain/explicit.ts": "export {};",
    });
    const a = twoLayerArchitecture(); const opened = openFixtureProjects(root, a);
    expect(inventory(root, a, opened.sources).files.map(file => file.relative)).toEqual(["src/domain/explicit.ts"]);
  });
  it("resolves inherited include/exclude relative to the config declaring them", () => {
    const root = projectFixture({
      "tsconfig.json": JSON.stringify({ extends: "./config/base.json" }),
      "config/base.json": JSON.stringify({ compilerOptions: requiredOptions, include: ["../src"], exclude: ["../src/excluded"] }),
      "src/excluded/ignored.ts": "export {};",
    });
    const a = twoLayerArchitecture(); const opened = openFixtureProjects(root, a);
    expect(inventory(root, a, opened.sources).files.map(file => file.relative)).toEqual(["src/domain/model.ts"]);
  });
  it("does not apply one project's exclusions to another project's sources", () => {
    const root = projectFixture({
      "tsconfig.a.json": JSON.stringify({ compilerOptions: requiredOptions, include: ["src"], exclude: ["src/domain/shared.ts"] }),
      "tsconfig.b.json": JSON.stringify({ compilerOptions: requiredOptions, files: ["src/domain/shared.ts"] }),
      "src/domain/shared.ts": "export {};",
    });
    const a = defineArchitecture({ projects: { tsconfigs: ["tsconfig.a.json", "tsconfig.b.json"] }, fileTypes: { app: { description: "App", files: ["src/**"] } } });
    const opened = openFixtureProjects(root, a);
    expect(inventory(root, a, opened.sources).files.map(file => file.relative)).toContain("src/domain/shared.ts");
  });
  it("does not silently exempt an architecture config selected by TypeScript", () => {
    const root = projectFixture({
      "tsconfig.json": JSON.stringify({ compilerOptions: requiredOptions, files: ["architecture.config.ts"] }),
      "architecture.config.ts": "export {};",
    });
    const a = twoLayerArchitecture(); const opened = openFixtureProjects(root, a);
    expect(inventory(root, a, opened.sources).issues).toContainEqual(expect.objectContaining({ file: "architecture.config.ts", ruleId: "file-classification" }));
  });
  it("reports weakened effective flags and strict subflags", () => {
    const root = projectFixture({}, { strictNullChecks: false, noUncheckedIndexedAccess: false });
    const opened = openFixtureProjects(root, twoLayerArchitecture());
    expect(opened.issues.map((issue) => issue.ruleId)).toEqual(expect.arrayContaining(["strict-typescript", "checked-indexed-access"]));
  });
  it("follows references from solution configurations", () => {
    const root = projectFixture({ "tsconfig.json": JSON.stringify({ files: [], references: [{ path: "./lib" }] }), "lib/tsconfig.json": JSON.stringify({ compilerOptions: { ...requiredOptions, composite: true }, files: ["entry.ts"] }), "lib/entry.ts": "export const lib = 1;" });
    const a = twoLayerArchitecture(); const opened = openFixtureProjects(root, a);
    expect(opened.projects.map((project) => project.configFileName)).toContain(join(root, "lib/tsconfig.json"));
  });
  it("keeps imports of excluded/generated source in scope, as TypeScript does", () => {
    const root = projectFixture({
      "tsconfig.json": JSON.stringify({ compilerOptions: { ...requiredOptions, module: "ESNext", moduleResolution: "Bundler" }, include: ["src"], exclude: ["src/generated/**"] }),
      "src/domain/model.ts": "export { value } from '../generated/model';",
      "src/generated/model.ts": "export const value = 1;",
      "src/generated/unreferenced.ts": "export {};",
    });
    const a = twoLayerArchitecture(); const opened = openFixtureProjects(root, a);
    expect(opened.sources.has(join(root, "src/generated/model.ts"))).toBe(true);
    expect(opened.sources.has(join(root, "src/generated/unreferenced.ts"))).toBe(false);
    expect(inventory(root, a, opened.sources).issues).toContainEqual(expect.objectContaining({ file: "src/generated/model.ts", ruleId: "file-classification" }));
  });
});
