import { defineArchitecture } from "../../src/index.js";

const projects = { tsconfigs: ["tsconfig.json"] } as const;
// These are compile-only tests, not runtime calls.
export const valid = () => defineArchitecture({
  projects,
  defaults: { imports: { internal: ["domain"] }, rules: { "max-file-lines": ["warn", { max: 123 }], "explicit-conditions": { options: { allowString: true }, reason: "Boundary" } } },
  fileTypes: { domain: { description: "Domain", files: ["src/**"], imports: { internal: ["domain"] } } },
});
export const invalid = () => {
  defineArchitecture({ projects, fileTypes: { domain: { description: "Domain", files: ["src/**"], imports: {
    // @ts-expect-error unknown file type must not widen inferred names
    internal: ["domian"],
  } } } });
  defineArchitecture({ projects, defaults: { imports: {
    // @ts-expect-error defaults must use inferred file type keys too
    internal: ["missing"],
  } }, fileTypes: { domain: { description: "Domain", files: ["src/**"] } } });
  defineArchitecture({ projects, defaults: { rules: {
    // @ts-expect-error unknown rule
    "made-up": "error",
  } }, fileTypes: { app: { description: "app", files: ["src/**"] } } });
  defineArchitecture({ projects, defaults: { rules: {
    // @ts-expect-error wrong option value
    "max-file-lines": ["error", { max: "many" }],
  } }, fileTypes: { app: { description: "app", files: ["src/**"] } } });
  defineArchitecture({ projects, defaults: { rules: {
    // @ts-expect-error unknown option
    "max-file-lines": ["error", { imaginary: true }],
  } }, fileTypes: { app: { description: "app", files: ["src/**"] } } });
  defineArchitecture({ projects, defaults: { rules: {
    // @ts-expect-error optionless rule
    "no-binding-alias": ["error", { allow: true }],
  } }, fileTypes: { app: { description: "app", files: ["src/**"] } } });
  defineArchitecture({ projects, fileTypes: { app: { description: "app", files: ["src/**"], rules: {
    // @ts-expect-error compiler options are project-wide
    "strict-typescript": "off",
  } } } });
  defineArchitecture({ projects, defaults: { rules: {
    // @ts-expect-error compiler policy cannot warn
    "strict-typescript": "warn",
  } }, fileTypes: { app: { description: "app", files: ["src/**"] } } });
};
