import { Linter } from "eslint";
import { describe, expect, it } from "vitest";
import { noBindingAliasRule } from "../src/rules/noBindingAlias.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";
import { noBindingAliasCases, validUndefinedCases, invalidUndefinedCases, outOfScopeCases } from "../src/rules/cases/noBindingAlias.cases.js";

runCustomRule(noBindingAliasRule, noBindingAliasCases);

// Check scope resolution with ESLint as well as Oxlint's RuleTester above.
const lint = (code: string) => new Linter().verify(code, {
  languageOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: { architecture: { rules: { "no-binding-alias": noBindingAliasRule.enforcement.implementation } } },
  rules: { "architecture/no-binding-alias": "error" },
});

describe("undefined scope compatibility", () => {
  it.each([...validUndefinedCases, ...outOfScopeCases])("allows $name", ({ code }) => {
    expect(lint(code)).toEqual([]);
  });
  it.each(invalidUndefinedCases)("rejects $name", ({ code }) => {
    expect(lint(code).map((message) => message.messageId)).toEqual(["bindingAlias"]);
  });
});
