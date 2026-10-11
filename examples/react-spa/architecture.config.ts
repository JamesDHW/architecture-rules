import { defineArchitecture } from "architecture-rules";

// Copy into the project root and adapt paths and packages; this is not a hidden preset.
export default defineArchitecture({
  projects: { tsconfigs: ["tsconfig.app.json", "tsconfig.node.json"] },

  naming: { case: "camelCase", suffixes: [".test", ".config"] },

  layers: {
    domain: {
      description: "Business decisions and readonly models.",
      files: ["src/features/*/domain/**/*.ts"],
      dependencies: { internal: ["domain", "contracts"] },
    },
    contracts: {
      description: "Boundary validation schemas.",
      files: ["src/features/*/contracts/**/*.ts"],
      dependencies: { internal: ["contracts"], external: ["zod"] },
    },
    component: {
      description: "Pure rendering from props.",
      files: ["src/features/*/ui/**/*.tsx"],
      naming: { case: "PascalCase" },
      dependencies: { internal: ["component", "domain", "contracts"], external: ["react", "react/jsx-runtime"] },
    },
    controller: {
      description: "React state and lifecycle coordination.",
      files: ["src/features/*/controllers/**/*.ts"],
      naming: { case: "camelCase", prefix: "use" },
      dependencies: { internal: ["domain", "contracts", "adapter"], external: ["react"] },
    },
    adapter: {
      description: "External API integration.",
      files: ["src/features/*/adapters/**/*.ts"],
      dependencies: { internal: ["domain", "contracts"] },
    },
    entry: {
      description: "Application composition.",
      files: ["src/main.tsx"],
      dependencies: { internal: ["component", "controller", "adapter"], external: ["react", "react-dom/client"] },
    },
    tooling: {
      description: "Bundler configuration.",
      files: ["vite.config.ts"],
      dependencies: { external: ["vite", "@vitejs/plugin-react", "node:path", "node:url"] },
    },
  },
});
