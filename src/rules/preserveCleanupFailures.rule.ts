import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
When only the operation fails, return its error. When only cleanup fails,
return that error. When both fail, return an error that keeps both, for
example with readonly operationError and cleanupError fields. When neither
fails, return the operation's successful result.

Good:
  if (result instanceof Error) {
    if (closeResult instanceof Error) {
      return new OperationAndCleanupError({ operationError: result, cleanupError: closeResult });
    }
    return result;
  }
  if (closeResult instanceof Error) return closeResult;
  return result;

Bad: return result; without inspecting a failed closeResult.

Do not silently replace or discard either failure. This is a semantic adapter
contract for review, not an AST claim about error subclasses or resource lifetimes.
`.trim();

export const preserveCleanupFailuresRule = defineRule({
  id: "preserve-cleanup-failures",
  title: "Preserve operation and cleanup failures together",
  description: DESCRIPTION,
  enforcement: { type: "advisory" },
});
