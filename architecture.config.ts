import { defineArchitecture } from "./dist/index.js";

export default defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },
  files: {
    otherFiles: ["*.md", "package.json", "pnpm-lock.yaml", "tsconfig*.json", ".gitignore"],
    toolingFiles: ["architecture.config.ts", "examples/react-spa/architecture.config.ts", "examples/node-cli/architecture.config.ts", "examples/typescript-library/architecture.config.ts"],
    generated: [
      { files: ["dist/**"], reason: "Committed build artifacts generated from src." },
      { files: ["node_modules_old/**"], reason: "Legacy dependency-install backup, not maintained application source." },
      { files: ["example/**"], reason: "External source snapshot supplied for manual findings review; not built or shipped by this package." },
    ],
  },
  defaults: {
    naming: { case: "camel", suffixes: [".rule", ".rules", ".test", ".config"] },
  },
  fileTypes: {
    framework: {
      description: "Architecture validation, project analysis, and public API.",
      files: ["src/core/**/*.ts", "src/architecture/**/*.ts", "src/index.ts", "src/plugin.ts", "src/picomatch.d.ts"],
      imports: { internal: ["framework", "rules"], external: ["typescript/unstable/**", "oxlint", "eslint", "picomatch"], builtins: ["fs", "path", "module", "url", "child_process"] },
    },
    rules: {
      description: "Canonical rule definitions and lint implementations.",
      files: ["src/rules/**/*.ts"],
      imports: { internal: ["rules", "framework"], external: ["eslint", "oxlint", "picomatch"], builtins: ["path"] },
    },
    cli: {
      description: "Command-line and generated compiler configuration adapters.",
      files: ["src/cli.ts", "src/cli/**/*.ts", "src/generateTsconfig.ts"],
      imports: { internal: ["cli", "framework", "rules"], external: [], builtins: ["fs", "fs/promises", "path", "url"] },
    },
    tests: {
      description: "Executable tests and compile-only API assertions.",
      files: ["tests/**/*.ts"],
      imports: { internal: ["tests", "framework", "rules", "cli"], external: ["vitest", "eslint", "oxlint/plugins-dev"], builtins: ["fs", "path", "os", "url", "child_process", "module"] },
    },
    tooling: {
      description: "Test-runner configuration included in the TypeScript project.",
      files: ["vitest.config.ts"],
      imports: { external: ["vitest/config"] },
    },
  },
});
