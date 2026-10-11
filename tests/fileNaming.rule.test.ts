import type { RuleTester } from "oxlint/plugins-dev";

import { fileNamingRule } from "../src/rules/fileNaming.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

type TestOptions = NonNullable<Exclude<Parameters<RuleTester["run"]>[2]["valid"][number], string>["options"]>;

const rulesPolicy = { architecture: { case: "camelCase", suffixes: [".rule", ".test"] } };
const hookPolicy = { architecture: { case: "camelCase", prefix: "use", allowedNames: ["page.tsx"] } };
const testPolicy = { architecture: { case: "camelCase", requiredSuffix: ".test", suffixes: [".rule"] } };
const componentPolicy = { architecture: { case: ["PascalCase", "kebab-case"], prefix: ["Admin", "admin-"] } };
const snakePolicy = { architecture: { case: "snake_case", requiredSuffix: [".model", ".view"] } };

const file = (filename: string, options: TestOptions) => ({ filename, options, code: "export const value = 1;\n" });

runCustomRule(fileNamingRule, {
  valid: [
    { name: "any filename without a naming policy", ...file("src/project-editor.tsx", []) },
    { name: "generic names are not banned without a policy", ...file("src/utils.ts", []) },
    { name: "optional suffixes stack", ...file("tests/noLet.rule.test.ts", [rulesPolicy]) },
    { name: "optional suffixes are optional", ...file("src/noLet.ts", [rulesPolicy]) },
    { name: "required prefix present", ...file("src/useProject.ts", [hookPolicy]) },
    { name: "an allowed framework name skips case and prefix", ...file("src/app/page.tsx", [hookPolicy]) },
    { name: "required suffix present, with an optional suffix before it", ...file("tests/noLet.rule.test.ts", [testPolicy]) },
    { name: "required suffix alone", ...file("tests/parseArgs.test.ts", [testPolicy]) },
    { name: "one of several cases: PascalCase", ...file("src/AdminPanel.tsx", [componentPolicy]) },
    { name: "one of several cases: kebab-case with its prefix", ...file("src/admin-panel.tsx", [componentPolicy]) },
    { name: "snake_case with one of several required suffixes", ...file("src/user_account.model.ts", [snakePolicy]) },
  ],
  invalid: [
    {
      name: "wrong case reports the suffixes it removed",
      ...file("tests/NoLet.rule.test.ts", [rulesPolicy]),
      errors: [{ message: "Filename 'NoLet.rule.test.ts' must use camelCase before .rule.test. See rule file-naming." }],
    },
    {
      name: "missing prefix",
      ...file("src/project.ts", [hookPolicy]),
      errors: [{ message: "Filename 'project.ts' must start with 'use'. See rule file-naming." }],
    },
    {
      name: "missing required suffix",
      ...file("tests/fixtures.ts", [testPolicy]),
      errors: [{ message: "Filename 'fixtures.ts' must end with '.test' before its extension. See rule file-naming." }],
    },
    {
      name: "a known suffix outside the list does not count",
      ...file("tests/noLet.spec.ts", [testPolicy]),
      errors: [{ message: "Filename 'noLet.spec.ts' must end with '.test' before its extension. See rule file-naming." }],
    },
    {
      name: "none of several cases",
      ...file("src/admin_panel.tsx", [componentPolicy]),
      errors: [{ message: "Filename 'admin_panel.tsx' must use PascalCase or kebab-case. See rule file-naming." }],
    },
    {
      name: "none of several prefixes",
      ...file("src/UserPanel.tsx", [componentPolicy]),
      errors: [{ message: "Filename 'UserPanel.tsx' must start with 'Admin' or 'admin-'. See rule file-naming." }],
    },
    {
      name: "kebab-case is not snake_case",
      ...file("src/user-account.view.ts", [snakePolicy]),
      errors: [{ message: "Filename 'user-account.view.ts' must use snake_case before .view. See rule file-naming." }],
    },
  ],
});
