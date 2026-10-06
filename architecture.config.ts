import { defineArchitecture } from "./dist/index.js";

export default defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },
  defaults: {
    naming: { case: "camel" },
  },
  fileTypes: {
    core: {
      description: "Rule definition primitives and type guards shared by every layer.",
      files: ["src/core/**/*.ts"],
      imports: { internal: ["core"], external: ["eslint"] },
    },
    errors: {
      description: "Error adapter: the only code that throws or catches.",
      files: ["src/errors/**/*.ts"],
      imports: { internal: ["errors"] },
      rules: {
        "no-raw-exceptions": {
          severity: "off",
          reason: "tryCatch converts exceptions into values, and orThrow is the one way back out at a public API boundary.",
        },
      },
    },
    rules: {
      description: "Canonical rule definitions and their lint implementations.",
      files: ["src/rules/**/*.ts"],
      naming: { case: "camel", suffixes: [".rule", ".rules", ".constants"] },
      imports: { internal: ["rules", "core"], external: ["eslint", "oxlint", "picomatch"], builtins: ["path"] },
    },
    config: {
      description: "Validates and normalizes a project's architecture.config.ts.",
      files: ["src/config/**/*.ts"],
      naming: { case: "camel", suffixes: [".constants", ".state"] },
      imports: { internal: ["config", "rules", "core", "errors"], external: ["eslint", "oxlint", "picomatch"], builtins: ["fs", "module", "path"] },
    },
    analysis: {
      description: "TypeScript program analysis: project membership, classification, imports and suppressions.",
      files: ["src/analysis/**/*.ts"],
      imports: {
        internal: ["analysis", "config", "rules", "core", "errors"],
        external: ["picomatch", "typescript/unstable/**"],
        builtins: ["child_process", "fs", "module", "path"],
      },
    },
    runner: {
      description: "Runs a check: structural analysis, then Oxlint, then compiler diagnostics.",
      files: ["src/runner/**/*.ts"],
      imports: {
        internal: ["runner", "analysis", "config", "rules", "core", "errors"],
        external: ["oxlint", "typescript/unstable/**"],
        builtins: ["child_process", "fs", "module", "path", "url"],
      },
    },
    cli: {
      description: "Command-line entry point, argument parsing and build scripts.",
      files: ["src/cli.ts", "src/cli/**/*.ts", "src/generateTsconfig.ts"],
      imports: { internal: ["cli", "runner", "config", "rules", "core", "errors"], builtins: ["fs", "fs/promises", "module", "path", "url"] },
    },
    api: {
      description: "Public package entry points.",
      files: ["src/index.ts", "src/plugin.ts"],
      imports: { internal: ["config", "rules", "core"], external: ["eslint"] },
    },
    tests: {
      description: "Executable tests.",
      files: ["tests/**/*.test.ts", "tests/utils/**/*.ts"],
      naming: { case: "camel", suffixes: [".rule.test", ".test"] },
      imports: {
        internal: ["tests", "api", "cli", "runner", "analysis", "config", "rules", "core", "errors"],
        external: ["eslint", "oxlint/plugins-dev", "vitest"],
        builtins: ["child_process", "fs", "module", "os", "path", "url"],
      },
    },
    typeTests: {
      description: "Compile-only assertions on the public configuration types.",
      files: ["tests/types/**/*.ts"],
      imports: { internal: ["api"] },
      rules: {
        "no-ts-comments": {
          options: [{ "ts-expect-error": "allow-with-description", "ts-ignore": true, "ts-nocheck": true }],
          reason: "Each @ts-expect-error is the assertion: it proves the types reject an invalid configuration.",
        },
      },
    },
    tooling: {
      description: "Test-runner configuration included in the TypeScript project.",
      files: ["vitest.config.ts"],
      naming: { case: "camel", suffixes: [".config"] },
      imports: { external: ["vitest/config"] },
    },
  },
});
