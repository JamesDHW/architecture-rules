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

ruleTester.run("file-naming", implementation, {
  valid: [
    {
      name: "PascalCase component",
      filename: "src/ProjectEditor.tsx",
      code: "export const ProjectEditor = () => null;\n",
    },
    {
      name: "PascalCase hook module",
      filename: "src/ProjectEditor.hook.ts",
      code: "export const useProjectEditor = () => ({});\n",
    },
    {
      name: "camelCase module",
      filename: "src/createProject.ts",
      code: "export const createProject = () => ({});\n",
    },
    {
      name: "camelCase constants suffix",
      filename: "src/foo.constants.ts",
      code: "export const foo = 1;\n",
    },
    {
      name: "entrypoint index",
      filename: "src/index.ts",
      code: "export {};\n",
    },
    {
      name: "framework page",
      filename: "src/app/page.tsx",
      code: "export const Page = () => null;\n",
    },
  ],
  invalid: [
    {
      name: "snake_case component",
      filename: "src/project_editor.tsx",
      code: "export const ProjectEditor = () => null;\n",
      errors: [{ messageId: "invalidFilename" }],
    },
    {
      name: "kebab-case component",
      filename: "src/project-editor.tsx",
      code: "export const ProjectEditor = () => null;\n",
      errors: [{ messageId: "invalidFilename" }],
    },
    {
      name: "generic utils filename",
      filename: "src/utils.ts",
      code: "export const identity = <Value>(value: Value) => value;\n",
      errors: [{ messageId: "bannedFilename" }],
    },
  ],
});
