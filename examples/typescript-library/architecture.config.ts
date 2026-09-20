import { defineArchitecture } from "architecture-rules";

export default defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },
  files: {
    otherFiles: ["package.json", "pnpm-lock.yaml", "tsconfig*.json", "README.md", ".gitignore"],
    toolingFiles: ["architecture.config.ts"],
    generated: [{ files: ["dist/**"], reason: "Published compiled library." }],
  },
  defaults: { naming: { case: "camel", suffixes: [".test"] } },
  fileTypes: {
    implementation: { description: "Library implementation.", files: ["src/**/*.ts"], exclude: ["src/index.ts"], imports: { internal: ["implementation"] } },
    api: { description: "Public library exports.", files: ["src/index.ts"], imports: { internal: ["implementation"] } },
    tests: { description: "Tests consuming the public API.", files: ["tests/**/*.ts"], imports: { internal: ["api", "tests"], external: ["vitest"] } },
  },
});
