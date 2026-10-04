import { defineArchitecture } from "architecture-rules";

export default defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },
  defaults: { naming: { case: "camel", suffixes: [".test"] } },
  fileTypes: {
    domain: { description: "Pure command decisions.", files: ["src/domain/**/*.ts"], imports: { internal: ["domain"] } },
    adapter: { description: "Filesystem and process integration.", files: ["src/adapters/**/*.ts"], imports: { internal: ["domain", "adapter"], builtins: ["fs/promises", "path", "child_process"] } },
    entry: { description: "CLI input parsing and composition.", files: ["src/main.ts"], imports: { internal: ["domain", "adapter"], builtins: ["util"] } },
  },
});
