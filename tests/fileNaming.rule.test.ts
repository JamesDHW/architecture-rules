import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";

import { fileNamingRule } from "../src/rules/fileNaming.rule.js";

if (fileNamingRule.enforcement.type !== "custom-oxlint") {
  throw new Error("file-naming must be a custom Oxlint rule");
}

const { implementation } = fileNamingRule.enforcement;

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

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
} as const;

ruleTester.run("file-naming", implementation, {
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
  ],
  invalid: [
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
