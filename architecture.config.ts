import { defineArchitecture } from "./dist/index.js";

export default defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },

  naming: { case: "camelCase" },

  layers: {
    core: {
      description: "Rule definition primitives and type guards shared by every layer.",
      files: ["src/core/**/*.ts"],
      dependencies: { internal: ["core"], external: ["eslint"] },
    },
    errors: {
      description: "Error adapter: the only code that throws or catches.",
      files: ["src/errors/**/*.ts"],
      dependencies: { internal: ["errors"] },
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
      naming: { case: "camelCase", suffixes: [".rule", ".rules", ".constants"] },
      dependencies: { internal: ["rules", "core"], external: ["eslint", "oxlint", "picomatch", "node:path"] },
    },
    config: {
      description: "Validates and normalizes a project's architecture.config.ts.",
      files: ["src/config/**/*.ts"],
      naming: { case: "camelCase", suffixes: [".constants", ".state"] },
      dependencies: {
        internal: ["config", "rules", "core", "errors"],
        external: ["eslint", "oxlint", "picomatch", "node:fs", "node:module", "node:path"],
      },
    },
    analysis: {
      description: "TypeScript program analysis: project membership, classification, imports and suppressions.",
      files: ["src/analysis/**/*.ts"],
      dependencies: {
        internal: ["analysis", "config", "rules", "core", "errors"],
        external: ["picomatch", "typescript/unstable/**", "node:child_process", "node:fs", "node:module", "node:path"],
      },
    },
    runner: {
      description: "Runs a check: structural analysis, then Oxlint, then compiler diagnostics.",
      files: ["src/runner/**/*.ts"],
      dependencies: {
        internal: ["runner", "analysis", "config", "rules", "core", "errors"],
        external: ["oxlint", "typescript/unstable/**", "node:child_process", "node:fs", "node:module", "node:path", "node:url"],
      },
    },
    cli: {
      description: "Command-line entry point, argument parsing and the describe command.",
      files: ["src/cli.ts", "src/cli/**/*.ts"],
      dependencies: {
        internal: ["cli", "runner", "config", "rules", "core", "errors"],
        external: ["node:fs", "node:module", "node:path", "node:url"],
      },
    },
    api: {
      description: "Public package entry points.",
      files: ["src/index.ts", "src/plugin.ts"],
      dependencies: { internal: ["config", "rules", "core"], external: ["eslint"] },
    },
    tests: {
      description: "Executable tests, one file per subject.",
      files: ["tests/**/*.test.ts"],
      naming: { case: "camelCase", requiredSuffix: ".test", suffixes: [".rule"] },
      dependencies: {
        internal: ["testSupport", "api", "cli", "runner", "analysis", "config", "rules", "core", "errors"],
        external: ["eslint", "oxlint/plugins-dev", "vitest", "node:child_process", "node:fs", "node:module", "node:path", "node:url"],
      },
    },
    testSupport: {
      description: "Fixtures and helpers shared by tests.",
      files: ["tests/utils/**/*.ts"],
      dependencies: {
        internal: ["testSupport", "analysis", "config", "core", "errors"],
        external: ["oxlint/plugins-dev", "vitest", "node:fs", "node:os", "node:path"],
      },
    },
    typeTests: {
      description: "Compile-only assertions on the public configuration types.",
      files: ["tests/types/**/*.ts"],
      dependencies: { internal: ["api"] },
      rules: {
        "no-ts-comments": {
          options: [{ "ts-expect-error": "allow-with-description", "ts-ignore": true, "ts-nocheck": true }],
          reason: "Each @ts-expect-error is the assertion: it proves the types reject an invalid configuration.",
        },
      },
    },
  },
});
