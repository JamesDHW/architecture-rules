import { defineArchitecture, type Architecture } from "../../src/index.js";

const projects = { tsconfigs: ["tsconfig.json"] } as const;
// These are compile-only tests, not runtime calls.
export const valid = (): Architecture => defineArchitecture({
  projects,
  rules: { "max-file-lines": ["warn", { max: 123 }], "explicit-conditions": { options: { allowString: true }, reason: "Boundary" } },
  layers: {
    domain: { description: "Domain", files: ["src/**"], naming: { case: ["PascalCase", "kebab-case"], requiredSuffix: ".model" }, dependencies: { internal: ["domain"], external: ["zod", "@tanstack/react-router/lazy", "node:fs"] } },
  },
});
export const invalid = (): void => {
  defineArchitecture({ projects,
    // @ts-expect-error filesystem allowlists were removed; TypeScript owns scope
    files: { otherFiles: ["**/*"] },
    layers: { app: { description: "app", files: ["src/**"] } },
  });
  defineArchitecture({ projects, layers: { domain: { description: "Domain", files: ["src/**"], dependencies: {
    // @ts-expect-error unknown layer must not widen inferred names
    internal: ["domian"],
  } } } });
  defineArchitecture({ projects,
    // @ts-expect-error dependencies are declared per layer, never project-wide
    dependencies: { internal: ["domain"] },
    layers: { domain: { description: "Domain", files: ["src/**"] } },
  });
  defineArchitecture({
    // @ts-expect-error projects lists tsconfigs; the stack is always TypeScript
    typescript: { projects: ["tsconfig.json"] },
    layers: { domain: { description: "Domain", files: ["src/**"] } },
  });
  defineArchitecture({ projects, layers: { domain: { description: "Domain", files: ["src/**"], naming: {
    // @ts-expect-error case names are spelled out
    case: "camel",
  } } } });
  defineArchitecture({ projects, rules: {
    // @ts-expect-error unknown rule
    "made-up": "error",
  }, layers: { app: { description: "app", files: ["src/**"] } } });
  defineArchitecture({ projects, rules: {
    // @ts-expect-error wrong option value
    "max-file-lines": ["error", { max: "many" }],
  }, layers: { app: { description: "app", files: ["src/**"] } } });
  defineArchitecture({ projects, rules: {
    // @ts-expect-error unknown option
    "max-file-lines": ["error", { imaginary: true }],
  }, layers: { app: { description: "app", files: ["src/**"] } } });
  defineArchitecture({ projects, rules: {
    // @ts-expect-error optionless rule
    "no-binding-alias": ["error", { allow: true }],
  }, layers: { app: { description: "app", files: ["src/**"] } } });
  defineArchitecture({ projects, layers: { app: { description: "app", files: ["src/**"], rules: {
    // @ts-expect-error compiler options are project-wide
    "strict-typescript": "off",
  } } } });
  defineArchitecture({ projects, rules: {
    // @ts-expect-error compiler policy cannot warn
    "strict-typescript": "warn",
  }, layers: { app: { description: "app", files: ["src/**"] } } });
};
