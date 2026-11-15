import { defineArchitecture } from "architecture-rules";

export default defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },

  naming: { case: "camelCase" },

  layers: {
    implementation: {
      description: "Library implementation.",
      files: ["src/**/*.ts"],
      exclude: ["src/index.ts"],
      dependencies: { internal: ["implementation"] },
    },
    api: {
      description: "Public library exports.",
      files: ["src/index.ts"],
      entry: { reason: "package.json exports this module; consumers import any of its exports.", exports: "all" },
      dependencies: { internal: ["implementation"] },
    },
    tests: {
      description: "Tests consuming the public API.",
      files: ["tests/**/*.test.ts"],
      naming: { case: "camelCase", requiredSuffix: ".test" },
      entry: { reason: "Vitest runs every test file." },
      development: true,
      dependencies: { internal: ["api"], external: ["vitest"] },
    },
  },
});
