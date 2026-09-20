import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Do not use else or else if. Handle the special case with an early return,
throw, break, or continue, then write the remaining path at the same level.

This also applies when both branches must continue to shared work. Extract
that exclusive decision into a descriptively named helper with a guard return,
then perform the shared work in the caller. Do not replace exclusive branches
with independent tests that reread a condition after an effect.

Good:
  const notifyProjectMembers = (project: Project): void => {
    sendProjectStatusNotification(project);
    recordNotificationDelivery(project.id);
  };

  const sendProjectStatusNotification = (project: Project): void => {
    if (project.isArchived) {
      sendArchiveNotification(project);
      return;
    }
    sendActiveNotification(project);
  };

Bad:
  if (project.isArchived) {
    sendArchiveNotification(project);
  } else {
    sendActiveNotification(project);
  }
  recordNotificationDelivery(project.id);

Put exceptional and terminal cases before the main path, even when that uses
a negated condition. Do not invert a guard merely to make its condition
positive. For example, if (!canEditProject) return accessDenied; followed by
return saveProject(project); is preferred over nesting the successful path.
Break and continue require a no-loop-jumps exception, and throw remains
restricted by the error-handling policy; naming them here grants no exemption.

An else branch forces the reader to retain the preceding predicate while
following later cases. Guard clauses keep each exit independently visible
and match the shape of exception-first boolean decisions.
`.trim();
const implementation = {
    meta: {
        type: "suggestion",
        docs: {
            description: DESCRIPTION,
        },
        messages: {
            noElse: "Do not use else. Handle the special case, then continue the remaining path. See rule no-else.",
        },
    },
    create(context) {
        return {
            IfStatement(node) {
                if (node.alternate === null || node.alternate === undefined) {
                    return;
                }
                context.report({
                    node: node.alternate,
                    messageId: "noElse",
                });
            },
        };
    },
};
export const noElseRule = defineRule({
    id: "no-else",
    title: "Do not use else",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=noElse.rule.js.map