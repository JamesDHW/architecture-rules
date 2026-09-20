import { describe, expect, it } from "vitest";
import { Linter } from "eslint";
import { defineArchitecture, normalizeArchitecture } from "../src/core/defineArchitecture.js";
import { defaultRules, validateOptions } from "../src/architecture/normalizeRules.js";
import { rules } from "../src/rules/index.js";
import { classify } from "../src/architecture/inventory.js";
import { namingError } from "../src/architecture/naming.js";
import { compileOxlintConfig } from "../src/architecture/compileOxlintConfig.js";
import { fileNamingRule } from "../src/rules/fileNaming.rule.js";
import { allowedImportsRule } from "../src/rules/allowedImports.rule.js";

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
  ])("rejects invalid runtime input %#", (input) => expect(() => normalizeArchitecture(input)).toThrow());
  it("validates all existing default lint configurations against pinned schemas", () => {
    const defaults = defaultRules();
    for (const rule of rules) {
      if (rule.id === "allowed-imports") continue; // runtime-generated edge payload
      expect(() => validateOptions(rule.id, defaults[rule.id]?.options ?? [])).not.toThrow();
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
  it("compiles only one effective policy per selected file", () => {
    const a = defineArchitecture({ ...base, defaults: { naming: { case: "pascal" } } });
    const policy = a.fileTypes.app!.policy;
    const config = compileOxlintConfig([{ path: "/project/src/abc.ts", relative: "src/abc.ts", type: "app", policy }], []);
    expect(config.overrides).toHaveLength(1);
    expect(config.overrides?.[0]?.rules?.["architecture/file-naming"]).toEqual(["error", { architecture: { case: "pascal" } }]);
  });
});
