import { Linter } from "eslint";
import { describe, expect, it } from "vitest";

import type { ArchitectureRule } from "../src/core/defineRule.js";
import { controlFlowBracesRule } from "../src/rules/controlFlowBraces.rule.js";
import { emptyBranchesRule } from "../src/rules/emptyBranches.rule.js";
import { noFinallyRule, noRawExceptionsRule } from "../src/rules/exceptionControlFlow.rules.js";
import { groupedLogicalOperatorsRule } from "../src/rules/groupedLogicalOperators.rule.js";
import { collectionLoopsRule, noLoopJumpsRule } from "../src/rules/loopControl.rules.js";
import { namedPredicatesRule } from "../src/rules/namedPredicates.rule.js";
import { noBindingAliasRule } from "../src/rules/noBindingAlias.rule.js";
import { noBooleanAssignmentBranchesRule } from "../src/rules/noBooleanAssignmentBranches.rule.js";
import { noCollapsibleIfRule } from "../src/rules/noCollapsibleIf.rule.js";
import { noElseRule } from "../src/rules/noElse.rule.js";
import { onePathOneResultRule } from "../src/rules/onePathOneResult.rule.js";
import { pureConditionsRule } from "../src/rules/pureConditions.rule.js";
import { simpleTernariesRule } from "../src/rules/simpleTernaries.rule.js";
import { terminalSwitchCasesRule } from "../src/rules/terminalSwitchCases.rule.js";

const lint = (rule: ArchitectureRule, code: string, options: readonly unknown[] = []) => {
  if (rule.enforcement.type !== "custom-oxlint") throw new Error("Expected a custom rule");
  return new Linter().verify(code, {
    languageOptions: { ecmaVersion: "latest", sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { architecture: { rules: { [rule.id]: rule.enforcement.implementation } } },
    rules: { [`architecture/${rule.id}`]: ["error", ...options] },
  });
};

const cases = [
  [controlFlowBracesRule, "const run = () => { if (isReady) return ready; };", undefined],
  [controlFlowBracesRule, "if (isReady) publish();", "requireBraces"],
  [controlFlowBracesRule, "const run = () => { if (isReady)\n return ready; };", "requireBraces"],
  [namedPredicatesRule, "if (!isNullish(project) && project.isArchived) { publish(); }", undefined],
  [namedPredicatesRule, "if (isNullish(project) || project.isArchived) { publish(); }", undefined],
  [namedPredicatesRule, "if (!isNullish(response.project) && response.project.members.length > 0) { publish(); }", undefined],
  [namedPredicatesRule, "if (!isNullish(project) && project.status === ARCHIVED_STATUS) { publish(); }", undefined],
  [namedPredicatesRule, "if (isNullish(project) && project.isArchived) { publish(); }", "namedPredicate"],
  [namedPredicatesRule, "if (!isNullish(project) || project.isArchived) { publish(); }", "namedPredicate"],
  [namedPredicatesRule, "if (!isNullish(project) && canEditProject(project)) { publish(); }", "namedPredicate"],
  [namedPredicatesRule, "if (!isNullish(project) && project.ownerId === currentUser.id) { publish(); }", "namedPredicate"],
  [namedPredicatesRule, "if (!isNullish(project) && currentUser.isAdministrator) { publish(); }", "namedPredicate"],
  [namedPredicatesRule, "if (!(isOwner || isAdministrator)) { publish(); }", "namedPredicate"],
  [namedPredicatesRule, "const panel = <>{(isOwner || isAdministrator) && <EditButton />}</>;", "namedPredicate"],
  [namedPredicatesRule, "const panel = <>{(!isNullish(project) && project.isArchived) && <ArchiveNotice />}</>;", undefined],
  [namedPredicatesRule, "const name = isNullish(suppliedName) ? 'Anonymous' : suppliedName;", "nullishFallback"],
  [namedPredicatesRule, "const name = !isNullish(suppliedName) ? suppliedName : 'Anonymous';", "nullishFallback"],
  [namedPredicatesRule, "const label = isNullish(project) ? 'Absent' : 'Present';", undefined],
  [namedPredicatesRule, "const panel = <>{isOwner && (isAdministrator && <EditButton />)}</>;", "namedPredicate"],
  [namedPredicatesRule, "const panel = <>{!isNullish(project) && (project.isArchived && <ArchiveNotice />)}</>;", undefined],
  [onePathOneResultRule, "const run = () => { if (isMissing) return unavailable; if (isArchived) return unavailable; };", "sameResult"],
  [onePathOneResultRule, "if (isOwner) { publish(); } checkpoint(); if (isAdministrator) { publish(); }", undefined],
  [onePathOneResultRule, "const run = () => { if (isMissing) return 'Not available'; if (isArchived) return 'Not  available'; };", undefined],
  [collectionLoopsRule, "for (const project of projects) { publish(project); }", undefined],
  [collectionLoopsRule, "while (isReady) { publish(); }", "loop"],
  [collectionLoopsRule, "for (;;) { publish(); }", "loop"],
  [collectionLoopsRule, "for (const projectId in projects) { publish(projectId); }", "loop"],
  [collectionLoopsRule, "do { publish(); } while (isReady);", "loop"],
  [noLoopJumpsRule, "for (const project of projects) { if (isArchived) continue; }", "jump"],
  [noLoopJumpsRule, "for (const project of projects) { if (isArchived) break; }", "jump"],
  [terminalSwitchCasesRule, "const run = () => { switch (status) { case 'idle': case 'loading': return pending; default: return ready; } };", undefined],
  [terminalSwitchCasesRule, "switch (status) { case 'idle': publish(); break; }", "terminal"],
  [terminalSwitchCasesRule, "const run = () => { switch (true) { case isReady: return ready; } };", "predicateSwitch"],
  [groupedLogicalOperatorsRule, "const canEdit = isAdministrator || (isOwner && isActive);", undefined],
  [groupedLogicalOperatorsRule, "const canEdit = isAdministrator || isOwner && isActive;", "grouping"],
  [emptyBranchesRule, "if (isReady) { /* intentional */ }", "empty"],
  [emptyBranchesRule, "if (isReady) { publish(); }", undefined],
  [pureConditionsRule, "if (project = loadProject()) { publish(project); }", "effect"],
  [pureConditionsRule, "if ((() => { count++; return isReady; })()) { publish(); }", "effect"],
  [pureConditionsRule, "if (register(() => { count++; })) { publish(); }", undefined],
  [pureConditionsRule, "const run = async () => { if (await hasAccess()) { publish(); } };", "effect"],
  [noBooleanAssignmentBranchesRule, "if (shouldEnable) { isEnabled = true; startSynchronization(); }", "booleanAssignment"],
  [noBooleanAssignmentBranchesRule, "if (shouldEnable) { setIsEnabled(true); }", undefined],
  [noBindingAliasRule, "const isEnabled = shouldEnable;", "bindingAlias"],
  [noBindingAliasRule, "isEnabled = shouldEnable;", "bindingAlias"],
  [noFinallyRule, "try { publish(); } finally { closeSession(); }", "finally"],
  [noRawExceptionsRule, "try { publish(); } catch (caught) { reportFailure(caught); }", "raw"],
  [simpleTernariesRule, "const Panel = () => isLoading ? <Loading /> : <Details />;", "renderState"],
  [simpleTernariesRule, "const Panel = () => <Button>{isSaving ? <Spinner /> : <SaveIcon />}</Button>;", undefined],
] as const;

describe("ESLint-compatible branching visitors (supplementary, not an Oxlint replacement)", () => {
  it.each(cases)("%s: %s", (rule, code, messageId) => {
    const messages = lint(rule, code);
    expect(messages.map((message) => message.messageId)).toEqual(messageId === undefined ? [] : [messageId]);
  });

  it("supports configured presence guards in both safe polarities", () => {
    for (const code of ["if (isPresent(project) && project.isArchived) { publish(); }", "if (!isPresent(project) || project.isArchived) { publish(); }"]) {
      expect(lint(namedPredicatesRule, code, [{ presenceGuards: ["isPresent"] }])).toEqual([]);
    }
  });

  it("rejects overlapping guard meanings", () => {
    expect(() => lint(namedPredicatesRule, "if (isReady) { publish(); }", [{ nullishGuards: ["isPresent"], presenceGuards: ["isPresent"] }])).toThrow("must not overlap");
  });

  it("keeps the preferred structural example compatible across interacting custom rules", () => {
    const code = "const notifyProject = (project) => { if (!isNullish(project) && project.isArchived) { sendArchiveNotification(project); } };";
    for (const rule of [controlFlowBracesRule, namedPredicatesRule, noElseRule, noCollapsibleIfRule, pureConditionsRule, emptyBranchesRule, noBindingAliasRule]) {
      expect(lint(rule, code), rule.id).toEqual([]);
    }
  });
});
