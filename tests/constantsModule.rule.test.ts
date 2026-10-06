import { constantsModuleRule } from "../src/rules/constantsModule.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(constantsModuleRule, {
  valid: [
    {
      name: "screaming snake in a constants module",
      filename: "src/ProjectQueue.constants.ts",
      code: "export const QUEUE_BACK_OFF_SECONDS = 30;\n",
    },
    {
      name: "camelCase local is not a semantic constant",
      filename: "src/scheduleRetry.ts",
      code: "const retryDelaySeconds = 30;\n",
    },
    {
      name: "single uppercase acronym is allowed inline",
      filename: "src/fetchResource.ts",
      code: 'const HTTP = "https";\n',
    },
    {
      name: "a let binding is not a semantic constant",
      filename: "src/scheduleRetry.ts",
      code: "let QUEUE_BACK_OFF_SECONDS = 30;\n",
    },
    {
      name: "a destructured binding is not checked",
      filename: "src/scheduleRetry.ts",
      code: "const { QUEUE_BACK_OFF_SECONDS } = settings;\n",
    },
  ],
  invalid: [
    {
      name: "screaming snake outside a constants module",
      filename: "src/scheduleRetry.ts",
      code: "const QUEUE_BACK_OFF_SECONDS = 30;\n",
      errors: [{ messageId: "constantsModule" }],
    },
    {
      name: "the message names the constant",
      filename: "src/scheduleRetry.ts",
      code: "export const MAX_RETRIES = 3;\n",
      errors: [{ message: "Declare 'MAX_RETRIES' in a *.constants.ts module. See rule constants-module." }],
    },
  ],
});
