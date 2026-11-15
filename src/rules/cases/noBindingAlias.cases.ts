import type { RuleCases } from "../../core/ruleCases.js";

export const validUndefinedCases = [
  { name: "global undefined initialization", code: "const compactStart = undefined;" },
  { name: "global undefined inside a function", code: "const reset = () => { const compactStart = undefined; return compactStart; };" },
  { name: "unrelated shadow in sibling scope", code: "function other(undefined) {} const compactStart = undefined;" },
];

export const invalidUndefinedCases = [
  { name: "parameter named undefined in initializer", code: "function example(undefined) { const otherName = undefined; }" },
  { name: "block-local undefined", code: "{ let undefined = 'value'; const otherName = undefined; }" },
  { name: "later lexical declaration still shadows undefined", code: "{ const otherName = undefined; let undefined = 'value'; }" },
  { name: "imported undefined", code: "import { undefined } from './values.js'; const otherName = undefined;" },
];

export /** Reassignment needs let, var or a parameter; no-let, no-var and no-param-reassign own those. */
const outOfScopeCases = [
  { name: "assignment", code: "isEnabled = shouldEnable;" },
  { name: "let cursor", code: "let child = node; child = child.parent;" },
  { name: "assignment to undefined", code: "let compactStart = 'started'; compactStart = undefined;" },
];

export const noBindingAliasCases: readonly RuleCases[] = [
  {
    valid: [
      ...validUndefinedCases,
      ...outOfScopeCases,
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
      {
        name: "export rename publishes a second public name",
        code: "const listedPackageSchema = createSchema();\nexport { listedPackageSchema as registeredPackageSchema };\n",
      },
    ],
    invalid: [
      ...invalidUndefinedCases.map((test) => ({ ...test, errors: [{ messageId: "bindingAlias" }] })),
      {
        name: "variable alias",
        code: "const isEnabled = shouldEnable;",
        errors: [{ messageId: "bindingAlias" }],
      },
      {
        name: "exported const alias",
        code: "const listedPackageSchema = createSchema();\nexport const registeredPackageSchema = listedPackageSchema;\n",
        errors: [{ messageId: "bindingAlias" }],
      },
      {
        name: "import rename",
        code: 'import { createProject as buildProject } from "./createProject.js";\n',
        errors: [{ messageId: "importAlias" }],
      },
    ],
  },
];
