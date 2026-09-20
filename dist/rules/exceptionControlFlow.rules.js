import { defineRule } from "../core/defineRule.js";
const RAW_DESCRIPTION = `
Ordinary application code branches on returned ProjectError instances instead
of throwing or catching exceptions. Immediately wrap throwing/rejecting external
operations with the shared tryCatch adapter. Permit raw catch and throw only
through documented scoped exceptions for the error adapter or a required API.

Good: const project = await tryCatch(() => loadExternalProject(projectId));
      if (project instanceof ProjectError) return project;
Bad: try { return await loadExternalProject(projectId); }
     catch (caught) { return new ProjectLoadError({ cause: caught }); }

The shared tryCatch implementation necessarily catches failures; a filename or
function name alone does not automatically grant an exception. This syntax
check does not prove that every potentially throwing external call is wrapped.
`.trim();
const rawImplementation = {
    meta: {
        type: "suggestion", docs: { description: RAW_DESCRIPTION }, schema: [],
        messages: { raw: "Return ProjectError values and use tryCatch for external failures. Raw catch/throw requires a documented adapter exception. See rule no-raw-exceptions." },
    },
    create(context) {
        return {
            "CatchClause, ThrowStatement"(node) { context.report({ node, messageId: "raw" }); },
        };
    },
};
export const noRawExceptionsRule = defineRule({
    id: "no-raw-exceptions",
    title: "Confine raw exceptions to explicit adapters",
    description: RAW_DESCRIPTION,
    enforcement: { type: "custom-oxlint", configuration: "error", implementation: rawImplementation },
});
const FINALLY_DESCRIPTION = `
Do not use finally by default, including in adapters that allow raw catch.
Use the shared tryCatch guarantee to sequence operation and cleanup explicitly:

Good:
  const result = await tryCatch(() => operation(session));
  const closeResult = await tryCatch(() => session.close());
  return resolveSessionOutcome(result, closeResult);

Bad:
  try { return await operation(session); }
  finally { await session.close(); }

Await operation completion before cleanup. The helper must normalize every
thrown value/rejection; do not assume this sequence remains safe if that
contract changes. Explicit sequencing avoids a second cleanup syntax and
prevents finally from silently replacing the operation's result with a cleanup
failure. Only an explicit scoped exception may allow an unavoidable API case.
`.trim();
const finallyImplementation = {
    meta: {
        type: "suggestion", docs: { description: FINALLY_DESCRIPTION }, schema: [],
        messages: { finally: "Use awaited tryCatch results followed by explicit cleanup; do not let cleanup hide an operation failure. See rule no-finally." },
    },
    create(context) {
        return {
            TryStatement(node) {
                if (node.finalizer !== null && node.finalizer !== undefined) {
                    context.report({ node: node.finalizer, messageId: "finally" });
                }
            },
        };
    },
};
export const noFinallyRule = defineRule({
    id: "no-finally",
    title: "Sequence normalized operations and cleanup without finally",
    description: FINALLY_DESCRIPTION,
    enforcement: { type: "custom-oxlint", configuration: "error", implementation: finallyImplementation },
});
export const preserveCleanupFailuresRule = defineRule({
    id: "preserve-cleanup-failures",
    title: "Preserve operation and cleanup failures together",
    description: `
When only the operation fails, return its ProjectError. When only cleanup
fails, return that ProjectError. When both fail, return a specific ProjectError
subclass with readonly operationError and cleanupError fields preserving both.
When neither fails, return the operation's successful result.

Good:
  if (result instanceof ProjectError) {
    if (closeResult instanceof ProjectError) {
      return new SessionOperationAndCleanupError({ operationError: result, cleanupError: closeResult });
    }
    return result;
  }
  if (closeResult instanceof ProjectError) return closeResult;
  return result;

Bad: return result; without inspecting a failed closeResult.

Do not silently replace or discard either failure. This is a semantic adapter
contract for review, not an AST claim about error subclasses or resource lifetimes.
`.trim(),
    enforcement: { type: "advisory" },
});
//# sourceMappingURL=exceptionControlFlow.rules.js.map