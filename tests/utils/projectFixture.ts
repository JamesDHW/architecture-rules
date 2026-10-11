import { defineArchitecture } from "../../src/config/defineArchitecture.js";
import type { Architecture } from "../../src/config/types.js";
import { temporaryRoot, tsconfigJson, writeFiles } from "./fixtures.js";
import { presetCompilerOptions } from "./preset.js";

/** The preset's compiler options, for fixtures that write their own tsconfig. */
export const requiredOptions = presetCompilerOptions();

/** A temporary project with one domain model and a bundler-style tsconfig, plus the given files. */
export const projectFixture = (files: Readonly<Record<string, string>> = {}, compilerOptions: Readonly<Record<string, unknown>> = {}): string => {
  const root = temporaryRoot("architecture-fixture-");
  writeFiles(root, {
    "tsconfig.json": tsconfigJson({ target: "ES2022", module: "ESNext", moduleResolution: "Bundler", ...compilerOptions }, { include: ["src/**/*.ts", "src/**/*.tsx"] }),
    "src/domain/model.ts": "export const value = 1;",
    ...files,
  });
  return root;
};

/** Domain may import only domain; adapters may import domain. */
export const twoLayerArchitecture = (): Architecture => defineArchitecture({
  projects: { tsconfigs: ["tsconfig.json"] },
  layers: {
    domain: { description: "Domain", files: ["src/domain/**"], dependencies: { internal: ["domain"] } },
    adapter: { description: "Adapter", files: ["src/adapters/**"], dependencies: { internal: ["domain"] } },
  },
});
