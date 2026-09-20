import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const LOOP_DESCRIPTION = `
Use for...of or for await...of for intentional iteration. Prefer dedicated
collection operations for direct transformations and searches. Do not use
classic for, for...in, while, or do...while by default. Require a documented
scoped exception for an API or algorithm that genuinely needs another form.

Good:
  for (const project of projects) { await publishProject(project); }
  for (const [projectIndex, project] of projects.entries()) {
    publishProjectAtPosition(project, projectIndex);
  }
  for (const [projectId, project] of Object.entries(projectsById)) {
    publishIndexedProject(projectId, project);
  }

Bad:
  for (let projectIndex = 0; projectIndex < projects.length; projectIndex++) {
    publishProject(projects[projectIndex]);
  }
  while (hasPendingJobs()) { processNextJob(); }

A single collection-loop syntax exposes the element directly, avoids index
bookkeeping, and aligns with immutable bindings and checked collection access.
`.trim();

export const collectionLoopsRule = defineRule({
  id: "collection-loops",
  title: "Use for...of as the default loop form",
  description: LOOP_DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: "error",
    implementation: {
      meta: {
        type: "suggestion",
        docs: { description: LOOP_DESCRIPTION },
        schema: [],
        messages: { loop: "Use for...of, for await...of, or a dedicated collection operation. Other loop forms require an explicit scoped exception. See rule collection-loops." },
      },
      create(context) {
        return {
          "ForStatement, ForInStatement, WhileStatement, DoWhileStatement"(node: Rule.Node) {
            context.report({ node, messageId: "loop" });
          },
        };
      },
    },
  },
});

const JUMP_DESCRIPTION = `
Do not use break, continue, or labelled statements by default. Use find/some
for searches, filter stable collections before effectful iteration, or extract
a focused helper that returns its result. Switch cases also return rather
than break. Document a scoped exception when an alternative is genuinely worse.

Good:
  const matchingProject = projects.find(matchesProject);
  const activeProjects = projects.filter(isProjectActive);
  for (const project of activeProjects) { await publishProject(project); }

Bad:
  for (const project of projects) {
    if (project.isArchived) continue;
    await publishProject(project);
  }

Never replace an exit with a mutable control flag. Filtering eagerly evaluates
all predicates before loop effects and may change behavior for state-dependent
predicates or unbounded streams. Do not automatically rewrite those cases.
This policy favors explicit selection and focused return-based operations over
multiple loop exit mechanisms; it does not claim every jump is a bug.
`.trim();

export const noLoopJumpsRule = defineRule({
  id: "no-loop-jumps",
  title: "Replace loop jumps with selection or focused operations",
  description: JUMP_DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: "error",
    implementation: {
      meta: {
        type: "suggestion",
        docs: { description: JUMP_DESCRIPTION },
        schema: [],
        messages: { jump: "Use selection, a dedicated operation, or a focused helper return instead of break, continue, or labels. Preserve evaluation order; never introduce a mutable flag. See rule no-loop-jumps." },
      },
      create(context) {
        return {
          "BreakStatement, ContinueStatement, LabeledStatement"(node: Rule.Node) {
            context.report({ node, messageId: "jump" });
          },
        };
      },
    },
  },
});
