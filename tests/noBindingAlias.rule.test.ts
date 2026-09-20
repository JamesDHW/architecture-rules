import { Linter } from "eslint";
import { describe, expect, it } from "vitest";

import { noBindingAliasRule } from "../src/rules/noBindingAlias.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

const validUndefinedCases = [
  { name: "global undefined initialization", code: "let compactStart = undefined;" },
  { name: "global undefined reset", code: "let compactStart = 'started'; compactStart = undefined;" },
  { name: "global undefined in an event callback", code: "let compactStart; onEnd(() => { compactStart = undefined; });" },
  { name: "unrelated shadow in sibling scope", code: "function other(undefined) {} let compactStart = undefined;" },
  { name: "null reset is unchanged", code: "let compactStart = null; compactStart = null;" },
];

const invalidUndefinedCases = [
  { name: "parameter named undefined in initializer", code: "function example(undefined) { const otherName = undefined; }" },
  { name: "parameter named undefined in assignment", code: "function example(undefined) { let otherName; otherName = undefined; }" },
  { name: "captured shadowed undefined", code: "function example(undefined) { onEnd(() => { otherName = undefined; }); }" },
  { name: "block-local undefined", code: "{ let undefined = 'value'; const otherName = undefined; }" },
  { name: "later lexical declaration still shadows undefined", code: "{ const otherName = undefined; let undefined = 'value'; }" },
  { name: "imported undefined", code: "import { undefined } from './values.js'; const otherName = undefined;" },
];

runCustomRule(noBindingAliasRule, {
  valid: [
    ...validUndefinedCases,
    {
      name: "computed value is not an alias",
      code: "const normalizedProjectName = projectName.trim();\n",
    },
    {
      name: "destructuring rename is allowed",
      code: "const { project: selectedProject } = response;\n",
    },
    {
      name: "import without rename",
      code: 'import { createProject } from "./createProject.js";\n',
    },
  ],
  invalid: [
    ...invalidUndefinedCases.map((test) => ({ ...test, errors: [{ messageId: "bindingAlias" }] })),
    {
      code: "const isEnabled = shouldEnable;",
      errors: [{ messageId: "bindingAlias" }],
    },
    {
      code: "isEnabled = shouldEnable;",
      errors: [{ messageId: "bindingAlias" }],
    },
    {
      name: "variable alias",
      code: "const name = projectName;\n",
      errors: [{ messageId: "bindingAlias" }],
    },
    {
      name: "import rename",
      code: 'import { createProject as buildProject } from "./createProject.js";\n',
      errors: [{ messageId: "importAlias" }],
    },
  ],
});

// Check scope resolution with ESLint as well as Oxlint's RuleTester above.
const lint = (code: string) => new Linter().verify(code, {
  languageOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: { architecture: { rules: { "no-binding-alias": noBindingAliasRule.enforcement.implementation } } },
  rules: { "architecture/no-binding-alias": "error" },
});

describe("undefined scope compatibility", () => {
  it.each(validUndefinedCases)("allows $name", ({ code }) => {
    expect(lint(code)).toEqual([]);
  });
  it.each(invalidUndefinedCases)("rejects $name", ({ code }) => {
    expect(lint(code).map((message) => message.messageId)).toEqual(["bindingAlias"]);
  });
});
