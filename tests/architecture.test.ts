import { describe, expect, it } from "vitest";
import { Linter } from "eslint";
import { defineArchitecture, normalizeArchitecture } from "../src/config/defineArchitecture.js";
import { ArchitectureError } from "../src/errors/architectureError.js";
import type { Architecture, EffectivePolicy } from "../src/config/types.js";
import { orThrow } from "../src/errors/tryCatch.js";
import { defaultRules, validateOptions } from "../src/config/normalizeRules.js";
import { rules } from "../src/rules/index.js";
import { classify } from "../src/analysis/inventory.js";
import { namingError } from "../src/rules/namingPolicy.js";
import { compileOxlintConfig } from "../src/runner/compileOxlintConfig.js";
import { fileNamingRule } from "../src/rules/fileNaming.rule.js";
import { allowedImportsRule } from "../src/rules/allowedImports.rule.js";

const appPolicy = (architecture: Architecture): EffectivePolicy => {
  const policy = architecture.layers.app?.policy;
  return policy ?? expect.unreachable("the app layer is defined");
};

const app = { description: "Application", files: ["src/**"] };
const base = { projects: { tsconfigs: ["tsconfig.json"] }, layers: { app } };

const issuesOf = (input: unknown): readonly string[] => {
  const result = normalizeArchitecture(input);
  return result instanceof ArchitectureError ? result.issues : [];
};

describe("architecture configuration", () => {
  it("denies every dependency by default and makes no naming assumptions", () => {
    const a = defineArchitecture(base);
    expect(a.defaults.naming).toBeUndefined();
    expect(appPolicy(a).dependencies).toEqual({ internal: [], external: [], assets: [] });
    expect(appPolicy(a).origins.dependencies).toBe("deny by default");
    expect(Object.isFrozen(a)).toBe(true);
  });
  it("preserves options with severity and replaces explicit objects", () => {
    const projectWide = { rules: { "max-file-lines": ["error", { max: 250, skipComments: false }] } } as const;
    const a = defineArchitecture({
      ...base, ...projectWide,
      layers: { app: { ...app, dependencies: { internal: ["app"] }, rules: { "max-file-lines": { severity: "warn", reason: "Migration" } } } },
    });
    expect(a.layers.app?.policy.rules["max-file-lines"]).toMatchObject({ severity: "warn", options: [{ max: 250, skipComments: false }], origin: "layers.app", reason: "Migration" });
    expect(appPolicy(a).dependencies.internal).toEqual(["app"]);
    expect(appPolicy(a).origins.dependencies).toBe("layers.app");
    const b = defineArchitecture({ ...base, ...projectWide, layers: { app: { ...app, rules: { "max-file-lines": { options: { max: 100 }, reason: "Focused files" } } } } });
    expect(b.layers.app?.policy.rules["max-file-lines"]?.options).toEqual([{ max: 100 }]);
    expect(appPolicy(b).dependencies.internal).toEqual([]);
  });
  it.each([
    { ...base, extra: true },
    { ...base, projects: { tsconfigs: [] } },
    { ...base, projects: ["tsconfig.json"] },
    { ...base, projects: { tsconfigs: ["tsconfig.json"], references: "all" } },
    { ...base, typescript: { projects: ["tsconfig.json"] } },
    { ...base, files: { toolingFiles: ["src/**"] } },
    { ...base, naming: { case: "kebab" } },
    { ...base, naming: { case: "camel" } },
    { ...base, naming: { case: [] } },
    { ...base, naming: { case: "camelCase", prefix: [] } },
    { ...base, dependencies: { zod: "Validation." } },
    { ...base, dependencies: { internal: ["app"] } },
    { ...base, imports: { layers: ["app"] } },
    { ...base, layers: { app: { ...app, imports: { layers: ["app"] } } } },
    { ...base, layers: { app: { ...app, dependencies: { internal: ["unknown"] } } } },
    { ...base, layers: { app: { ...app, dependencies: { packages: ["zod"] } } } },
    { ...base, layers: { app: { ...app, dependencies: { external: "zod" } } } },
    { ...base, rules: { unknown: "error" } },
    { ...base, rules: { "max-file-lines": ["error", { max: "bad" }] } },
    { ...base, rules: { "max-file-lines": ["error", { unknown: true }] } },
    { ...base, rules: { "no-binding-alias": ["error", {}] } },
    { ...base, rules: { "no-binding-alias": { severity: "off", reason: "" } } },
    { ...base, rules: { "strict-typescript": "warn" } },
    { ...base, layers: { app: { ...app, rules: { "strict-typescript": "off" } } } },
    { ...base, layers: { app: { ...app, generated: { reason: " " } } } },
    { ...base, layers: { app: { ...app, generated: { reason: "Codegen", extra: true } } } },
    { ...base, layers: { app: { ...app, generated: { reason: "Codegen" }, rules: { "max-file-lines": "off" } } } },
    { ...base, generated: { reason: "Codegen" } },
    { projects: { tsconfigs: ["tsconfig.json"] }, fileTypes: { app } },
  ])("rejects invalid runtime input %#", (input) => expect(normalizeArchitecture(input)).toBeInstanceOf(ArchitectureError));
  it("reports every configuration problem at once, then throws at the API boundary", () => {
    const input = { ...base, naming: { case: "kebab" }, layers: { app: { ...app, dependencies: { internal: ["unknown"] } } } };
    expect(issuesOf(input)).toEqual([
      "naming.case must be camelCase, PascalCase, kebab-case, snake_case or a list of them",
      "layers.app.dependencies.internal: unknown layer 'unknown'",
    ]);
    expect(() => orThrow(normalizeArchitecture(input))).toThrow("naming.case must be camelCase");
  });
  it("writes Node built-ins one way, with the node: prefix", () => {
    const withExternal = (external: readonly string[]): unknown => ({ ...base, layers: { app: { ...app, dependencies: { external } } } });
    expect(issuesOf(withExternal(["react", "react/jsx-runtime", "@tanstack/react-router/**", "node:fs", "node:fs/promises", "node:*"]))).toEqual([]);
    expect(issuesOf(withExternal(["fs", "fs/promises", "node:nope"]))).toEqual([
      "layers.app.dependencies.external: write the Node built-in 'fs' as 'node:fs'",
      "layers.app.dependencies.external: write the Node built-in 'fs/promises' as 'node:fs/promises'",
      "layers.app.dependencies.external: 'node:nope' is not a Node built-in",
    ]);
  });
  it("validates all existing default lint configurations against pinned schemas", () => {
    const defaults = defaultRules();
    // allowed-imports carries a payload the runner generates at check time.
    const configured = rules.filter((rule) => rule.id !== "allowed-imports");
    for (const rule of configured) {
      expect(validateOptions(rule.id, defaults[rule.id]?.options ?? [])).toEqual([]);
    }
  });
  it("classifies paths independently of naming and never merges layers", () => {
    const a = defineArchitecture({ ...base, naming: { case: "PascalCase" }, layers: { app: { ...app, exclude: ["**/*.test.ts"] }, tests: { description: "Tests", files: ["**/*.test.ts"] } } });
    expect(classify(a, "src/abc.ts")).toEqual(["app"]);
    expect(classify(a, "src/abc.test.ts")).toEqual(["tests"]);
    const overlap = defineArchitecture({ ...base, layers: { app, second: app } });
    expect(classify(overlap, "src/abc.ts")).toEqual(["app", "second"]);
  });
  it("enforces names after selecting files", () => {
    expect(namingError("src/abc.ts", { case: "PascalCase" })).toContain("PascalCase");
    expect(namingError("src/Abc.d.ts", { case: "PascalCase" })).toBeUndefined();
    expect(namingError("src/Abc.test.ts", { case: "PascalCase" })).toBeDefined();
    expect(namingError("src/Abc.test.ts", { case: "PascalCase", suffixes: [".test"] })).toBeUndefined();
  });
  it("bridges source diagnostics into ordinary lint suppressions", () => {
    const verify = (code: string) => new Linter().verify(code, {
      plugins: { architecture: { rules: { "allowed-imports": allowedImportsRule.enforcement.implementation, "file-naming": fileNamingRule.enforcement.implementation } } },
      rules: { "architecture/allowed-imports": ["error", { issues: [{ line: 2, column: 0, message: "Denied import" }] }] },
    });
    expect(verify("// comment\nimport './x.js';")).toHaveLength(1);
    expect(verify("// eslint-disable-next-line architecture/allowed-imports -- external boundary\nimport './x.js';")).toEqual([]);
  });
  it("records why a layer is generated", () => {
    const a = defineArchitecture({ ...base, layers: { app: { ...app, generated: { reason: "Written by the router plugin" } } } });
    expect(a.layers.app?.policy.generated).toEqual({ reason: "Written by the router plugin" });
    expect(defineArchitecture(base).layers.app?.policy.generated).toBeUndefined();
  });
  it("lets configuration files use a default export", () => {
    const policy = appPolicy(defineArchitecture(base));
    const config = compileOxlintConfig([
      { path: "/project/vite.config.ts", relative: "vite.config.ts", layer: "app", policy },
      { path: "/project/src/config.ts", relative: "src/config.ts", layer: "app", policy },
    ], []);
    expect(config.overrides?.[0]?.rules?.["import/no-default-export"]).toBe("off");
    expect(config.overrides?.[1]?.rules?.["import/no-default-export"]).toEqual(["error"]);
  });
  it("compiles only one effective policy per selected file", () => {
    const a = defineArchitecture({ ...base, naming: { case: "PascalCase" } });
    const policy = appPolicy(a);
    const config = compileOxlintConfig([{ path: "/project/src/abc.ts", relative: "src/abc.ts", layer: "app", policy }], []);
    expect(config.overrides).toHaveLength(1);
    expect(config.overrides?.[0]?.rules?.["architecture/file-naming"]).toEqual(["error", { architecture: { case: "PascalCase" } }]);
  });
});
