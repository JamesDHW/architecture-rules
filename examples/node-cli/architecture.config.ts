import { defineArchitecture } from "architecture-rules";

export default defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },

  naming: { case: "camelCase", suffixes: [".test"] },

  layers: {
    domain: {
      description: "Pure command decisions.",
      files: ["src/domain/**/*.ts"],
      dependencies: { internal: ["domain"] },
    },
    adapter: {
      description: "Filesystem and process integration.",
      files: ["src/adapters/**/*.ts"],
      dependencies: { internal: ["domain", "adapter"], external: ["node:fs/promises", "node:path", "node:child_process"] },
    },
    cli: {
      description: "CLI input parsing and composition.",
      files: ["src/main.ts"],
      entry: { reason: "package.json's bin runs this file." },
      dependencies: { internal: ["domain", "adapter"], external: ["node:util"] },
    },
  },
});
