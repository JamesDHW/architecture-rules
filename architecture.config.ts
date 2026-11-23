import { defineArchitecture } from "./dist/index.js";

export default defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },

  naming: { case: "camelCase" },

  layers: {
    core: {
      description: "Rule definition primitives and type guards shared by every layer.",
      files: ["src/core/**/*.ts"],
      dependencies: { external: ["eslint"] },
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
      naming: { case: "camelCase", suffixes: [".rule", ".rules", ".constants", ".cases"] },
      dependencies: { internal: ["rules", "core"], external: ["eslint", "oxlint", "node:path"] },
      rules: {
        "no-embedded-code": { severity: "off", reason: "Rule descriptions, guidance and test cases are code samples, written as strings on purpose." },
      },
    },
    config: {
      description: "Validates and normalizes a project's architecture.config.ts.",
      files: ["src/config/**/*.ts"],
      naming: { case: "camelCase", suffixes: [".constants", ".state"] },
      dependencies: {
        internal: ["config", "rules", "core", "errors"],
        external: ["eslint", "oxlint", "picomatch", "node:fs", "node:module", "node:path", "node:url"],
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
      description: "Runs a check: structural analysis, then Oxlint, then compiler diagnostics, with a cache of each stage.",
      files: ["src/runner/**/*.ts"],
      naming: { case: "camelCase", suffixes: [".constants"] },
      dependencies: {
        internal: ["runner", "analysis", "config", "rules", "core", "errors"],
        external: ["oxlint", "typescript/unstable/**", "node:child_process", "node:crypto", "node:fs", "node:module", "node:path", "node:stream/consumers", "node:url"],
      },
    },
    baseline: {
      description: "Incremental adoption: the baseline of recorded debt, the files a change touches, and the gates a check must pass.",
      files: ["src/baseline/**/*.ts"],
      naming: { case: "camelCase", suffixes: [".constants"] },
      dependencies: {
        internal: ["baseline", "runner", "analysis", "config", "core", "errors"],
        external: ["node:child_process", "node:fs", "node:path"],
      },
    },
    editor: {
      description: "Language server: publishes the check's findings to editors.",
      files: ["src/editor/**/*.ts"],
      naming: { case: "camelCase", suffixes: [".state"] },
      dependencies: {
        internal: ["editor", "baseline", "runner", "config", "rules", "core", "errors"],
        external: ["node:path", "node:url"],
      },
    },
    cli: {
      description: "Command-line entry point, argument parsing, the describe command and build scripts.",
      files: ["src/cli.ts", "src/cli/**/*.ts", "src/generateRuleDocs.ts"],
      entry: { files: ["src/cli.ts", "src/generateRuleDocs.ts"], reason: "package.json's bin runs the CLI; the build runs the rule-docs generator." },
      naming: { case: "camelCase", suffixes: [".constants"] },
      dependencies: {
        internal: ["cli", "editor", "baseline", "runner", "analysis", "config", "rules", "core", "errors"],
        external: ["node:fs", "node:fs/promises", "node:path", "node:url"],
      },
    },
    api: {
      description: "Public package entry points.",
      files: ["src/index.ts", "src/plugin.ts"],
      entry: { reason: "package.json exports these modules as the package's public API.", exports: "all" },
      dependencies: { internal: ["config", "rules", "core"], external: ["eslint"] },
    },
    tests: {
      description: "Executable tests, one file per subject.",
      files: ["tests/**/*.test.ts"],
      entry: { reason: "Vitest runs every test file." },
      development: true,
      naming: { case: "camelCase", requiredSuffix: ".test", suffixes: [".rule"] },
      rules: {
        "no-embedded-code": { severity: "off", reason: "Tests write fixture projects, so their source code is in strings on purpose." },
        "max-function-lines": { severity: "off", reason: "A describe() callback groups one subject's cases; each it() stays short." },
        "max-function-lines-warn": { severity: "off", reason: "A describe() callback groups one subject's cases; each it() stays short." },
      },
      dependencies: {
        internal: ["testSupport", "api", "cli", "editor", "runner", "analysis", "config", "rules", "core", "errors"],
        external: ["eslint", "vitest", "node:child_process", "node:fs", "node:module", "node:path", "node:url"],
      },
    },
    testSupport: {
      description: "Fixtures and helpers shared by tests.",
      files: ["tests/utils/**/*.ts"],
      development: true,
      rules: {
        "no-embedded-code": { severity: "off", reason: "Fixture helpers write source files, so their code is in strings on purpose." },
      },
      dependencies: {
        internal: ["testSupport", "analysis", "config", "core", "errors"],
        external: ["oxlint/plugins-dev", "vitest", "node:child_process", "node:fs", "node:os", "node:path", "node:url"],
      },
    },
    typeTests: {
      description: "Compile-only assertions on the public configuration types.",
      files: ["tests/types/**/*.ts"],
      entry: { reason: "The typecheck compiles these assertions; nothing imports them.", exports: ["valid", "validGlossary", "invalid", "invalidGlossary"] },
      development: true,
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
