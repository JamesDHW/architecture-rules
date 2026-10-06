import { isPresent } from "../core/guards.js";
import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Do not use finally, including in the error adapter. Sequence the operation and
its cleanup explicitly through the adapter:

Good:
  const result = await tryCatch(() => operation(session));
  const closeResult = await tryCatch(() => session.close());
  return resolveSessionOutcome(result, closeResult);

Bad:
  try { return await operation(session); }
  finally { await session.close(); }

Await operation completion before cleanup. The adapter must normalize every
thrown value and rejection; do not assume this sequence remains safe if that
contract changes. Explicit sequencing avoids a second cleanup syntax and
prevents finally from silently replacing the operation's result with a cleanup
failure. Only an explicit scoped exception may allow an unavoidable API case.
`.trim();
const implementation = {
    meta: {
        type: "suggestion", docs: { description: DESCRIPTION }, schema: [],
        messages: { finally: "Sequence the operation and its cleanup through the error adapter; do not let cleanup hide an operation failure. See rule no-finally." },
    },
    create(context) {
        return {
            TryStatement(node) {
                if (isPresent(node.finalizer)) {
                    context.report({ node: node.finalizer, messageId: "finally" });
                }
            },
        };
    },
};
export const noFinallyRule = defineRule({
    id: "no-finally",
    title: "Sequence normalized operations and cleanup without finally",
    description: DESCRIPTION,
    enforcement: { type: "custom-oxlint", configuration: "error", implementation },
});
//# sourceMappingURL=noFinally.rule.js.map