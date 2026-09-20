import { emptyBranchesRule } from "../src/rules/emptyBranches.rule.js";
import {
  noFinallyRule,
  noRawExceptionsRule,
} from "../src/rules/exceptionControlFlow.rules.js";
import { groupedLogicalOperatorsRule } from "../src/rules/groupedLogicalOperators.rule.js";
import {
  collectionLoopsRule,
  noLoopJumpsRule,
} from "../src/rules/loopControl.rules.js";
import { pureConditionsRule } from "../src/rules/pureConditions.rule.js";
import { terminalSwitchCasesRule } from "../src/rules/terminalSwitchCases.rule.js";
import { runCustomRule } from "./utils/runCustomRule.js";

runCustomRule(collectionLoopsRule, {
  valid: [
    "for (const project of projects) { publishProject(project); }",
    "const publish = async () => { for await (const project of projects) { await publishProject(project); } };",
  ],
  invalid: [
    "for (;;) {}",
    "for (const projectId in projects) {}",
    "while (isReady) {}",
    "do {} while (isReady);",
  ].map((code) => ({ code, errors: [{ messageId: "loop" }] })),
});

runCustomRule(noLoopJumpsRule, {
  valid: ["const findProject = () => projects.find(matchesProject);"],
  invalid: [
    {
      code: "for (const project of projects) { if (isArchived) continue; }",
      errors: [{ messageId: "jump" }],
    },
    {
      code: "for (const project of projects) { if (isArchived) break; }",
      errors: [{ messageId: "jump" }],
    },
    {
      code: "search: for (const project of projects) { break search; }",
      errors: [{ messageId: "jump" }, { messageId: "jump" }],
    },
  ],
});

runCustomRule(terminalSwitchCasesRule, {
  valid: [
    "const handle = () => { switch (status) { case 'idle': case 'loading': return pending; default: return ready; } };",
    "const handle = () => { switch (status) { case 'idle': { return pending; } default: { return ready; } } };",
    "const handle = () => { switch (status) { case 'idle': return pending; default: return status satisfies never; } };",
  ],
  invalid: [
    {
      code: "switch (status) { case 'idle': publish(); break; }",
      errors: [{ messageId: "terminal" }],
    },
    {
      code: "switch (status) { case 'idle': }",
      errors: [{ messageId: "terminal" }],
    },
    {
      code: "const handle = () => { switch (status) { case 'idle': if (isReady) return ready; } };",
      errors: [{ messageId: "terminal" }],
    },
    {
      code: "const handle = () => { switch (true) { case isReady: return ready; } };",
      errors: [{ messageId: "predicateSwitch" }],
    },
    {
      code: "const handle = () => { switch (false) { case isReady: return ready; } };",
      errors: [{ messageId: "predicateSwitch" }],
    },
  ],
});

runCustomRule(groupedLogicalOperatorsRule, {
  valid: [
    "const canEdit = isAdministrator || (isOwner && isActive);",
    "const canEdit = isOwner && isActive && hasAccess;",
    "const canEdit = (isOwner || isAdministrator) && isActive;",
  ],
  invalid: [
    "const canEdit = isAdministrator || isOwner && isActive;",
    "const canEdit = isOwner && isActive || isAdministrator;",
  ].map((code) => ({ code, errors: [{ messageId: "grouping" }] })),
});

runCustomRule(emptyBranchesRule, {
  valid: [
    "if (isReady) { publish(); }",
    "const noop = () => {};",
    "const handle = () => { switch (status) { case 'idle': return; } };",
  ],
  invalid: [
    "if (isReady) {}",
    "if (isReady) { /* deliberate */ }",
    "if (isReady);",
    "switch (status) {}",
  ].map((code) => ({ code, errors: [{ messageId: "empty" }] })),
});

runCustomRule(pureConditionsRule, {
  valid: [
    "if (hasAccess(project)) { publish(project); }",
    "const isReady = hasAccess(project) && isProjectActive(project);",
    "if (registerPredicate(() => { count++; })) { publish(); }",
    "const label = suppliedName ?? getDefaultName();",
    "const publish = async () => { if (isReady) { await publishProject(); } };",
  ],
  invalid: [
    "if (project = loadProject()) { publish(project); }",
    "if (count++ > 0) { publish(); }",
    "if (delete project.name) { publish(); }",
    "const publish = async () => { if (await hasAccess(project)) { publishProject(); } };",
    "const ready = isReady && count++;",
    "const label = (count++, isReady) ? 'Ready' : 'Other';",
    "if ((() => { count++; return isReady; })()) { publish(); }",
    "if (new Project()) { publish(); }",
  ].map((code) => ({ code, errors: [{ messageId: "effect" }] })),
});

runCustomRule(noRawExceptionsRule, {
  valid: ["const result = await tryCatch(() => loadProject());"],
  invalid: [
    "throw new ProjectError();",
    "try { loadProject(); } catch (caught) { reportFailure(caught); }",
  ].map((code) => ({ code, errors: [{ messageId: "raw" }] })),
});

runCustomRule(noFinallyRule, {
  valid: ["try { loadProject(); } catch (caught) { reportFailure(caught); }"],
  invalid: [
    {
      code: "try { loadProject(); } finally { closeSession(); }",
      errors: [{ messageId: "finally" }],
    },
  ],
});
