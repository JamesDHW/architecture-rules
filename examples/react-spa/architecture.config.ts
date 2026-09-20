import { defineArchitecture } from "architecture-rules";

// Copy into the project root and adapt paths/packages; this is not a hidden preset.
export default defineArchitecture({
  projects: { tsconfigs: ["tsconfig.app.json", "tsconfig.node.json"] },
  files: {
    otherFiles: ["package.json", "pnpm-lock.yaml", "tsconfig*.json", "README.md", ".gitignore", "index.html", "public/**"],
    toolingFiles: ["architecture.config.ts"],
    generated: [{ files: ["dist/**"], reason: "Bundler output." }],
  },
  defaults: { naming: { case: "camel", suffixes: [".test", ".config"] } },
  fileTypes: {
    domain: { description: "Business decisions and readonly models.", files: ["src/features/*/domain/**/*.ts"], imports: { internal: ["domain", "contracts"] } },
    contracts: { description: "Boundary validation schemas.", files: ["src/features/*/contracts/**/*.ts"], imports: { internal: ["contracts"], external: ["zod"] } },
    component: { description: "Pure rendering from props.", files: ["src/features/*/ui/**/*.tsx"], naming: { case: "pascal" }, imports: { internal: ["component", "domain", "contracts"], external: ["react", "react/jsx-runtime"] } },
    controller: { description: "React state and lifecycle coordination.", files: ["src/features/*/controllers/**/*.ts"], naming: { case: "camel", prefix: "use" }, imports: { internal: ["domain", "contracts", "adapter"], external: ["react"] } },
    adapter: { description: "External API integration (no automatic mutation exemption).", files: ["src/features/*/adapters/**/*.ts"], imports: { internal: ["domain", "contracts"] } },
    entry: { description: "Application composition.", files: ["src/main.tsx"], imports: { internal: ["component", "controller", "adapter"], external: ["react", "react-dom/client"] } },
    tooling: { description: "Bundler configuration.", files: ["vite.config.ts"], imports: { external: ["vite", "@vitejs/plugin-react"], builtins: ["path", "url"] } },
  },
});
