import { describe, expect, it } from "vitest";

import { buildTsconfig } from "../src/generateTsconfig.js";
import { rules } from "../src/rules/index.js";

describe("buildTsconfig", () => {
  it("contains every TypeScript enforcement", () => {
    const { compilerOptions } = buildTsconfig();

    for (const rule of rules) {
      if (rule.enforcement.type !== "typescript") {
        continue;
      }

      expect(compilerOptions).toMatchObject(rule.enforcement.compilerOptions);
    }
  });

  it("does not include consumer-local compiler settings", () => {
    const { compilerOptions } = buildTsconfig();

    expect(compilerOptions).not.toHaveProperty("target");
    expect(compilerOptions).not.toHaveProperty("module");
    expect(compilerOptions).not.toHaveProperty("jsx");
    expect(compilerOptions).not.toHaveProperty("include");
  });
});
