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
  const policy = architecture.fileTypes.app?.policy;
  return policy ?? expect.unreachable("the app file type is defined");
};

const base = { projects: { tsconfigs: ["tsconfig.json"] }, fileTypes: { app: { description: "Application", files: ["src/**"] } } };

describe("architecture configuration", () => {
  it("has conservative imports and no naming assumptions", () => {
    const a = defineArchitecture(base);
    expect(a.defaults.naming).toBeUndefined();
    expect(a.fileTypes.app?.policy.imports).toEqual({ internal: [], external: [], builtins: [], assets: [] });
    expect(Object.isFrozen(a)).toBe(true);
  });
  it("preserves options with severity and replaces explicit objects", () => {
    const a = defineArchitecture({ ...base, defaults: { rules: { "max-file-lines": ["error", { max: 250, skipComments: false }] }, imports: { internal: ["app"] } }, fileTypes: { app: { ...base.fileTypes.app, rules: { "max-file-lines": { severity: "warn", reason: "Migration" } } } } });
    expect(a.fileTypes.app?.policy.rules["max-file-lines"]).toMatchObject({ severity: "warn", options: [{ max: 250, skipComments: false }], origin: "fileTypes.app", reason: "Migration" });
    expect(a.fileTypes.app?.policy.imports.internal).toEqual(["app"]);
    const b = defineArchitecture({ ...base, defaults: { rules: { "max-file-lines": ["error", { max: 250, skipComments: false }] }, imports: { internal: ["app"] } }, fileTypes: { app: { ...base.fileTypes.app, imports: {}, rules: { "max-file-lines": { options: { max: 100 }, reason: "Focused files" } } } } });
    expect(b.fileTypes.app?.policy.rules["max-file-lines"]?.options).toEqual([{ max: 100 }]);
    expect(b.fileTypes.app?.policy.imports.internal).toEqual([]);
  });
  it.each([
    { ...base, extra: true },
    { ...base, projects: { tsconfigs: [] } },
    { ...base, files: { toolingFiles: ["src/**"] } },
    { ...base, files: { generated: [{ files: ["dist/**"], reason: " " }] } },
    { ...base, defaults: { naming: { case: "kebab" } } },
    { ...base, defaults: { imports: { internal: ["unknown"] } } },
    { ...base, defaults: { rules: { unknown: "error" } } },
    { ...base, defaults: { rules: { "max-file-lines": ["error", { max: "bad" }] } } },
    { ...base, defaults: { rules: { "max-file-lines": ["error", { unknown: true }] } } },
    { ...base, defaults: { rules: { "no-binding-alias": ["error", {}] } } },
    { ...base, defaults: { rules: { "no-binding-alias": { severity: "off", reason: "" } } } },
    { ...base, defaults: { rules: { "strict-typescript": "warn" } } },
    { ...base, fileTypes: { app: { ...base.fileTypes.app, rules: { "strict-typescript": "off" } } } },
    { ...base, fileTypes: { app: { ...base.fileTypes.app, generated: { reason: " " } } } },
    { ...base, fileTypes: { app: { ...base.fileTypes.app, generated: { reason: "Codegen", extra: true } } } },
    { ...base, fileTypes: { app: { ...base.fileTypes.app, generated: { reason: "Codegen" }, rules: { "max-file-lines": "off" } } } },
    { ...base, defaults: { generated: { reason: "Codegen" } } },
  ])("rejects invalid runtime input %#", (input) => expect(normalizeArchitecture(input)).toBeInstanceOf(ArchitectureError));
  it("reports every configuration problem at once, then throws at the API boundary", () => {
    const input = { ...base, defaults: { naming: { case: "kebab" }, imports: { internal: ["unknown"] } } };
    const result = normalizeArchitecture(input);
    expect(result).toBeInstanceOf(ArchitectureError);
    expect(result instanceof ArchitectureError ? result.issues : []).toEqual(["Invalid defaults.naming.case", "Unknown internal file type: unknown"]);
    expect(() => orThrow(result)).toThrow("Invalid defaults.naming.case");
  });
  it("validates all existing default lint configurations against pinned schemas", () => {
    const defaults = defaultRules();
    // allowed-imports carries a payload the runner generates at check time.
    const configured = rules.filter((rule) => rule.id !== "allowed-imports");
    for (const rule of configured) {
      expect(validateOptions(rule.id, defaults[rule.id]?.options ?? [])).toEqual([]);
    }
  });
  it("classifies paths independently of naming and never merges types", () => {
    const a = defineArchitecture({ ...base, defaults: { naming: { case: "pascal" } }, fileTypes: { app: { ...base.fileTypes.app, exclude: ["**/*.test.ts"] }, tests: { description: "Tests", files: ["**/*.test.ts"] } } });
    expect(classify(a, "src/abc.ts")).toEqual(["app"]);
    expect(classify(a, "src/abc.test.ts")).toEqual(["tests"]);
    const overlap = defineArchitecture({ ...base, fileTypes: { app: base.fileTypes.app, second: base.fileTypes.app } });
    expect(classify(overlap, "src/abc.ts")).toEqual(["app", "second"]);
  });
  it("enforces names after selecting files", () => {
    expect(namingError("src/abc.ts", { case: "pascal" })).toContain("pascal");
    expect(namingError("src/Abc.d.ts", { case: "pascal" })).toBeUndefined();
    expect(namingError("src/Abc.test.ts", { case: "pascal" })).toBeDefined();
    expect(namingError("src/Abc.test.ts", { case: "pascal", suffixes: [".test"] })).toBeUndefined();
  });
  it("bridges source diagnostics into ordinary lint suppressions", () => {
    const verify = (code: string) => new Linter().verify(code, {
      plugins: { architecture: { rules: { "allowed-imports": allowedImportsRule.enforcement.implementation, "file-naming": fileNamingRule.enforcement.implementation } } },
      rules: { "architecture/allowed-imports": ["error", { issues: [{ line: 2, column: 0, message: "Denied import" }] }] },
    });
    expect(verify("// comment\nimport './x.js';")).toHaveLength(1);
    expect(verify("// eslint-disable-next-line architecture/allowed-imports -- external boundary\nimport './x.js';")).toEqual([]);
  });
  it("records why a file type is generated", () => {
    const a = defineArchitecture({ ...base, fileTypes: { app: { ...base.fileTypes.app, generated: { reason: "Written by the router plugin" } } } });
    expect(a.fileTypes.app?.policy.generated).toEqual({ reason: "Written by the router plugin" });
    expect(defineArchitecture(base).fileTypes.app?.policy.generated).toBeUndefined();
  });
  it("lets configuration files use a default export", () => {
    const policy = appPolicy(defineArchitecture(base));
    const config = compileOxlintConfig([
      { path: "/project/vite.config.ts", relative: "vite.config.ts", type: "app", policy },
      { path: "/project/src/config.ts", relative: "src/config.ts", type: "app", policy },
    ], []);
    expect(config.overrides?.[0]?.rules?.["import/no-default-export"]).toBe("off");
    expect(config.overrides?.[1]?.rules?.["import/no-default-export"]).toEqual(["error"]);
  });
  it("compiles only one effective policy per selected file", () => {
    const a = defineArchitecture({ ...base, defaults: { naming: { case: "pascal" } } });
    const policy = appPolicy(a);
    const config = compileOxlintConfig([{ path: "/project/src/abc.ts", relative: "src/abc.ts", type: "app", policy }], []);
    expect(config.overrides).toHaveLength(1);
    expect(config.overrides?.[0]?.rules?.["architecture/file-naming"]).toEqual(["error", { architecture: { case: "pascal" } }]);
  });
});
