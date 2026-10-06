import { defineRule, defineRuleOptions } from "../core/defineRule.js";
import { isPresent, isRecord, isStringArray } from "../core/guards.js";
import { continuesAndChain, getJsxPresenceCondition, isNullishFallback, needsName } from "./namedPredicateConditions.js";
import { isBranchTest } from "./nodeContext.js";
import { toPredicateNode } from "./predicateNode.js";
import { withPlaceholders } from "./messagePlaceholders.js";
const guardListOption = (options, key, fallback) => {
    const [config] = options;
    const value = isRecord(config) ? config[key] : undefined;
    return isStringArray(value) ? value : fallback;
};
const readGuardNames = (options) => ({
    nullish: guardListOption(options, "nullishGuards", ["isNullish"]),
    presence: guardListOption(options, "presenceGuards", []),
});
const overlappingGuardIssues = (guards) => {
    const overlaps = guards.nullish.some((name) => guards.presence.includes(name));
    return overlaps ? ["named-predicates: nullishGuards and presenceGuards must not overlap."] : [];
};
const validateOptions = (options) => overlappingGuardIssues(readGuardNames(options));
const DESCRIPTION = `
Name compound conditions in if statements, loop tests, ternary tests, and JSX
rendering conditions. Assigned and returned boolean expressions may implement
predicates directly. A standalone predicate call needs no additional wrapper.

Exception: an approved nullish/presence guard may precede one property check on
that same binding or noncomputed property path. Allow nested properties and
comparisons to literals or SCREAMING_SNAKE_CASE constants, not runtime values.
Use the polarity that makes the property access safe. Additional domain clauses
still require a name. A guard combined with another predicate call should be
absorbed into that predicate, preserving any required type narrowing.

Good:
  if (!isNullish(project) && project.isArchived) { showArchiveNotice(project); }
  if (isNullish(project) || project.status === "archived") { return unavailable; }
  if (canEditProject(project)) { openProjectEditor(); }
  const canEditProject = (project: Project | null | undefined): boolean => {
    if (isNullish(project)) return false;
    return project.isEditable;
  };

Bad:
  if (project !== undefined && project.isArchived) { showArchiveNotice(project); }
  if (!isNullish(project) && canEditProject(project)) { openProjectEditor(); }
  if (!isNullish(project) && project.ownerId === currentUser.id) { openProjectEditor(); }
  return <>{(isOwner || isAdministrator) && <EditButton />}</>;

Configure nullishGuards and presenceGuards by bare function name. Defaults are
["isNullish"] and [], respectively. Names must not occur in both lists. Matching
names does not prove type-guard semantics, purity, or stability of property reads.
Implement approved guards as genuine type predicates and review their behavior.
Reuse an existing guard helper rather than writing a second one. Explicit standalone null/undefined comparisons
remain allowed when the distinction matters. Ternaries using these approved
guards solely to default the guarded value must use ?? instead (the same
nullish-defaults policy, extended here because this rule owns guard names).
This rule does not rewrite guard
implementations or forbid their returned null/undefined comparisons.

A predicate name communicates domain intention; the narrow structural exception
avoids names that merely restate safe property access.
`.trim();
const implementation = {
    meta: {
        type: "suggestion",
        docs: { description: DESCRIPTION },
        schema: [{
                type: "object",
                properties: {
                    nullishGuards: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
                    presenceGuards: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
                },
                additionalProperties: false,
            }],
        messages: {
            nullishFallback: "Use ?? instead of a guard-based ternary that only supplies a missing-value fallback. See rules named-predicates and nullish-defaults.",
            namedPredicate: "Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.",
        },
    },
    create(context) {
        const guards = readGuardNames(context.options);
        const [optionIssue] = overlappingGuardIssues(guards);
        // oxlint-disable-next-line architecture/no-raw-exceptions -- ESLint and Oxlint reject invalid rule options when create() throws.
        if (optionIssue !== undefined)
            throw new Error(optionIssue);
        const configuredGuards = [...guards.nullish, ...guards.presence].join(", ");
        const guardList = configuredGuards === "" ? "none configured" : configuredGuards;
        const reportUnnamed = (node) => {
            context.report(withPlaceholders({ node, messageId: "namedPredicate" }, { guards: guardList }));
        };
        const isUnnamedTest = (test) => needsName(toPredicateNode(test), guards);
        /** Statement handlers run first, so a branch test that needs a name has already been reported. */
        const isReportedTest = (node) => isBranchTest(node) && isUnnamedTest(node);
        const checkTest = (test) => {
            const isReported = isPresent(test) && isUnnamedTest(test);
            if (isReported) {
                reportUnnamed(test);
            }
        };
        return {
            IfStatement(node) { checkTest(node.test); },
            WhileStatement(node) { checkTest(node.test); },
            DoWhileStatement(node) { checkTest(node.test); },
            ForStatement(node) { checkTest(node.test); },
            ConditionalExpression(node) {
                checkTest(node.test);
                if (isNullishFallback(node, guards)) {
                    context.report({ node, messageId: "nullishFallback" });
                }
            },
            LogicalExpression(node) {
                if (continuesAndChain(node))
                    return;
                const isUnnamedPresence = needsName(getJsxPresenceCondition(node), guards) && !isReportedTest(node);
                if (isUnnamedPresence) {
                    reportUnnamed(node);
                }
            },
        };
    },
};
export const namedPredicatesRule = defineRule({
    id: "named-predicates",
    options: defineRuleOptions(implementation.meta?.schema ?? [], validateOptions),
    title: "Name your predicates",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=namedPredicates.rule.js.map