import { noBindingAliasRule } from "../src/rules/noBindingAlias.rule.js";
import { runCustomRule } from "./runCustomRule.js";

runCustomRule(noBindingAliasRule, {
  valid: [
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
