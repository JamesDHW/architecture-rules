import { describe, expect, it } from "vitest";

import { createConfig } from "../src/core/createConfig.js";
import { rules } from "../src/rules/index.js";

const oxlintBackedRules = rules.filter(
  (rule) =>
    rule.enforcement.type === "oxlint" ||
    rule.enforcement.type === "custom-oxlint",
);

const typescriptRules = rules.filter(
  (rule) => rule.enforcement.type === "typescript",
);

describe("createConfig", () => {
  it("includes every Oxlint-backed personal rule", () => {
    const { rules: configuredRules } = createConfig();

    for (const rule of oxlintBackedRules) {
      if (rule.enforcement.type === "oxlint") {
        expect(configuredRules).toHaveProperty(rule.enforcement.rule);
        continue;
      }

      expect(configuredRules).toHaveProperty(`architecture/${rule.id}`);
    }
  });

  it("includes every custom rule as architecture/<id>", () => {
    const { rules: configuredRules } = createConfig();
    const customRules = rules.filter(
      (rule) => rule.enforcement.type === "custom-oxlint",
    );

    for (const rule of customRules) {
      expect(configuredRules).toHaveProperty(`architecture/${rule.id}`);
    }
  });

  it("excludes TypeScript-only rules from Oxlint", () => {
    const { rules: configuredRules } = createConfig();

    for (const rule of typescriptRules) {
      expect(configuredRules).not.toHaveProperty(rule.id);

      for (const compilerOption of Object.keys(
        rule.enforcement.compilerOptions,
      )) {
        expect(configuredRules).not.toHaveProperty(compilerOption);
      }
    }
  });

  it("translates personal IDs into actual Oxlint IDs", () => {
    const { rules: configuredRules } = createConfig();

    expect(configuredRules).toMatchObject({
      "typescript/strict-boolean-expressions": [
        "error",
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
        },
      ],
    });
    expect(configuredRules).not.toHaveProperty("explicit-conditions");
    expect(configuredRules).not.toHaveProperty("file-naming");
    expect(configuredRules).not.toHaveProperty("no-enums");
    expect(configuredRules).not.toHaveProperty("guard-clauses");
    expect(configuredRules).not.toHaveProperty("named-jsx-handlers");
    expect(configuredRules).not.toHaveProperty("no-boolean-cast");
    expect(configuredRules).not.toHaveProperty("prefer-logical-over-ternary");
    expect(configuredRules).not.toHaveProperty("named-predicates");
    expect(configuredRules).not.toHaveProperty("prefer-switch");
  });

  it("uses warn for deep relative imports", () => {
    const { rules: configuredRules } = createConfig();

    expect(configuredRules?.["architecture/no-deep-relative-imports"]).toBe(
      "warn",
    );
  });

  it("uses warn for one path one result", () => {
    const { rules: configuredRules } = createConfig();

    expect(configuredRules?.["architecture/one-path-one-result"]).toBe("warn");
  });

  it("applies global disables by personal rule ID", () => {
    const { rules: configuredRules } = createConfig({
      rules: {
        "file-naming": "off",
      },
    });

    expect(configuredRules?.["architecture/file-naming"]).toBe("off");
    expect(configuredRules?.["typescript/strict-boolean-expressions"]).toEqual([
      "error",
      {
        allowString: false,
        allowNumber: false,
        allowNullableObject: false,
      },
    ]);
  });

  it("keeps default options when a global severity override is applied", () => {
    const { rules: configuredRules } = createConfig({
      rules: {
        "explicit-conditions": "warn",
      },
    });

    expect(configuredRules?.["typescript/strict-boolean-expressions"]).toEqual([
      "warn",
      {
        allowString: false,
        allowNumber: false,
        allowNullableObject: false,
      },
    ]);
  });

  it("applies glob overrides by personal rule ID and strips reason", () => {
    const config = createConfig({
      overrides: [
        {
          files: ["src/generated/**"],
          reason: "Generated files follow the upstream generator's conventions.",
          rules: {
            "file-naming": "off",
          },
        },
      ],
    });

    expect(config.overrides).toEqual([
      {
        files: ["src/generated/**"],
        rules: {
          "architecture/file-naming": "off",
        },
      },
    ]);
  });

  it("enables type-aware linting and the architecture JS plugin", () => {
    const config = createConfig();

    expect(config.options?.typeAware).toBe(true);
    expect(config.jsPlugins).toEqual([
      {
        name: "architecture",
        specifier: "architecture-rules/plugin",
      },
    ]);
  });

  it("passes client file-naming options through personal rule IDs", () => {
    const { rules: configuredRules } = createConfig({
      rules: {
        "file-naming": [
          "error",
          {
            suffixes: {
              ".tsx": "pascal",
            },
          },
        ],
      },
    });

    expect(configuredRules?.["architecture/file-naming"]).toEqual([
      "error",
      {
        suffixes: {
          ".tsx": "pascal",
        },
      },
    ]);
  });

  it("accepts an absolute plugin specifier for CLI runs", () => {
    const config = createConfig({
      pluginSpecifier: "/tmp/architecture-rules/plugin.js",
    });

    expect(config.jsPlugins).toEqual([
      {
        name: "architecture",
        specifier: "/tmp/architecture-rules/plugin.js",
      },
    ]);
  });
});
