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
  ],
  invalid: [
    {
      name: "three parents",
      code: 'import { Project } from "../../../domain/Project.js";\n',
      errors: [{ messageId: "deepRelativeImport" }],
    },
  ],
});
