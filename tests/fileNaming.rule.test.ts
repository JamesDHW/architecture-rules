import { fileNamingRule } from "../src/rules/fileNaming.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

const rulesPolicy = { architecture: { case: "camel", suffixes: [".test", ".rule.test"] } };

const hookPolicy = { architecture: { case: "camel", prefix: "use", allowedNames: ["page.tsx"] } };

const clientPolicy = {
  allow: {
    framework: ["**/page.tsx", "**/layout.tsx"],
  },
  banned: ["utils.ts", "utils.tsx", "helpers.ts", "helpers.tsx"],
  suffixes: {
    ".hook.ts": "pascal",
    ".constants.ts": "camel",
    ".tsx": "pascal",
    ".ts": "pascalOrCamel",
  },
};

runCustomRule(fileNamingRule, {
  valid: [
    {
      name: "any filename when the client supplies no policy",
      filename: "src/project-editor.tsx",
      code: "export const ProjectEditor = () => null;\n",
    },
    {
      name: "generic dumping-ground names when the client supplies no policy",
      filename: "src/utils.ts",
      code: "export const identity = <Value>(value: Value) => value;\n",
    },
    {
      name: "PascalCase component with client suffix rules",
      filename: "src/ProjectEditor.tsx",
      options: [clientPolicy],
      code: "export const ProjectEditor = () => null;\n",
    },
    {
      name: "PascalCase hook module with client suffix rules",
      filename: "src/ProjectEditor.hook.ts",
      options: [clientPolicy],
      code: "export const useProjectEditor = () => ({});\n",
    },
    {
      name: "camelCase module with client suffix rules",
      filename: "src/createProject.ts",
      options: [clientPolicy],
      code: "export const createProject = () => ({});\n",
    },
    {
      name: "camelCase constants suffix with client suffix rules",
      filename: "src/foo.constants.ts",
      options: [clientPolicy],
      code: "export const foo = 1;\n",
    },
    {
      name: "framework page allowed by named glob group",
      filename: "src/app/page.tsx",
      options: [clientPolicy],
      code: "export const Page = () => null;\n",
    },
    {
      name: "architecture policy: the longest matching suffix is removed before the case check",
      filename: "tests/noLet.rule.test.ts",
      options: [rulesPolicy],
      code: "export const cases = [];\n",
    },
    {
      name: "architecture policy: required prefix present",
      filename: "src/useProject.ts",
      options: [hookPolicy],
      code: "export const useProject = () => ({});\n",
    },
    {
      name: "architecture policy: allowed framework name skips case and prefix",
      filename: "src/app/page.tsx",
      options: [hookPolicy],
      code: "export const Page = () => null;\n",
    },
  ],
  invalid: [
    {
      name: "architecture policy: wrong case reports the suffix it removed",
      filename: "tests/NoLet.rule.test.ts",
      options: [rulesPolicy],
      code: "export const cases = [];\n",
      errors: [{ message: "Filename 'NoLet.rule.test.ts' must use camel case before .rule.test. See rule file-naming." }],
    },
    {
      name: "architecture policy: missing prefix",
      filename: "src/project.ts",
      options: [hookPolicy],
      code: "export const project = {};\n",
      errors: [{ message: "Filename 'project.ts' must start with 'use'. See rule file-naming." }],
    },
    {
      name: "snake_case component with client suffix rules",
      filename: "src/project_editor.tsx",
      options: [clientPolicy],
      code: "export const ProjectEditor = () => null;\n",
      errors: [{ messageId: "invalidFilename" }],
    },
    {
      name: "kebab-case component with client suffix rules",
      filename: "src/project-editor.tsx",
      options: [clientPolicy],
      code: "export const ProjectEditor = () => null;\n",
      errors: [{ messageId: "invalidFilename" }],
    },
    {
      name: "generic utils filename with client banned list",
      filename: "src/utils.ts",
      options: [clientPolicy],
      code: "export const identity = <Value>(value: Value) => value;\n",
      errors: [{ messageId: "bannedFilename" }],
    },
  ],
});
