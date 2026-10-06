import { noDeepRelativeImportsRule } from "../src/rules/noDeepRelativeImports.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(noDeepRelativeImportsRule, {
  valid: [
    {
      name: "one parent",
      code: 'import { Project } from "../Project.js";\n',
    },
    {
      name: "two parents",
      code: 'import { Project } from "../../domain/Project.js";\n',
    },
    {
      name: "alias import",
      code: 'import { Project } from "@projects/domain/Project.js";\n',
    },
    {
      name: "local export without a source",
      code: "export const project = 1;\n",
    },
  ],
  invalid: [
    {
      name: "three parents",
      code: 'import { Project } from "../../../domain/Project.js";\n',
      errors: [{ messageId: "deepRelativeImport" }],
    },
    {
      name: "named re-export through three parents",
      code: 'export { Project } from "../../../domain/Project.js";\n',
      errors: [{ messageId: "deepRelativeImport" }],
    },
    {
      name: "star re-export through three parents",
      code: 'export * from "../../../domain/Project.js";\n',
      errors: [{ messageId: "deepRelativeImport" }],
    },
  ],
});
