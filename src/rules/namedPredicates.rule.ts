import type { Rule } from "eslint";

import { defineRule, defineRuleOptions } from "../core/defineRule.js";
import { isGuardedNullishFallback, isStructuralGuardCondition, type GuardNames, type PredicateNode } from "./structuralGuardCondition.js";

export type NamedPredicatesOptions = {
  readonly nullishGuards?: readonly string[];
  readonly presenceGuards?: readonly string[];
};

const validateOptions = (options: readonly unknown[]): void => {
  const config = options[0] as NamedPredicatesOptions | undefined;
  const nullish = config?.nullishGuards ?? ["isNullish"];
  const presence = config?.presenceGuards ?? [];
  if (nullish.some((name) => presence.includes(name))) throw new Error("named-predicates: guard lists must not overlap");
};

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
Reuse an existing helper; otherwise consider @shared/utils/isNullish. That path
is a suggestion, not a requirement. Explicit standalone null/undefined comparisons
remain allowed when the distinction matters. Ternaries using these approved
guards solely to default the guarded value must use ?? instead (the same
nullish-defaults policy, extended here because this rule owns guard names).
This rule does not rewrite guard
implementations or forbid their returned null/undefined comparisons.

A predicate name communicates domain intention; the narrow structural exception
avoids names that merely restate safe property access.
`.trim();

const implementation: Rule.RuleModule = {
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
      namedPredicate:
        "Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. Reuse a helper; otherwise consider @shared/utils/isNullish (optional). See rule named-predicates.",
    },
  },
  create(context) {
    const options = context.options[0] as NamedPredicatesOptions | undefined;
    const guards: GuardNames = {
      nullish: options?.nullishGuards ?? ["isNullish"],
      presence: options?.presenceGuards ?? [],
    };
    if (guards.nullish.some((name) => guards.presence.includes(name))) {
      throw new Error("named-predicates: nullishGuards and presenceGuards must not overlap.");
    }
    const reported = new WeakSet<object>();
    const check = (test: object | null | undefined, reportNode = test): void => {
      if (test === null || test === undefined || reportNode === null || reportNode === undefined) return;
      const condition = test as PredicateNode;
      if (condition.type === "UnaryExpression") {
        check(condition.argument, reportNode);
        return;
      }
      if (["ChainExpression", "TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression", "ParenthesizedExpression"].includes(condition.type)) {
        check(condition.expression, reportNode);
        return;
      }
      if (condition.type !== "LogicalExpression") return;
      if (isStructuralGuardCondition(condition, guards) || reported.has(reportNode)) return;
      reported.add(reportNode);
      context.report({
        node: reportNode as Rule.Node,
        messageId: "namedPredicate",
        data: { guards: [...guards.nullish, ...guards.presence].join(", ") || "none configured" },
      });
    };
    return {
      IfStatement(node) { check(node.test); },
      WhileStatement(node) { check(node.test); },
      DoWhileStatement(node) { check(node.test); },
      ForStatement(node) { check(node.test); },
      ConditionalExpression(node) {
        check(node.test);
        if (isGuardedNullishFallback(node as PredicateNode, guards)) {
          context.report({ node, messageId: "nullishFallback" });
        }
      },
      LogicalExpression(node) {
        if (node.operator !== "&&") return;
        if (node.parent.type === "LogicalExpression" && node.parent.operator === "&&" && node.parent.right === node) return;
        const condition = getJsxPresenceCondition(node as PredicateNode);
        if (condition !== undefined) check(condition, node);
      },
    };
  },
};

const getJsxPresenceCondition = (node: PredicateNode): PredicateNode | undefined => {
  if (node.type !== "LogicalExpression" || node.operator !== "&&" || node.left === undefined || node.right === undefined) return undefined;
  if (node.right.type === "JSXElement" || node.right.type === "JSXFragment") return node.left;
  const innerCondition = getJsxPresenceCondition(node.right);
  if (innerCondition === undefined) return undefined;
  return { type: "LogicalExpression", operator: "&&", left: node.left, right: innerCondition };
};

export const namedPredicatesRule = defineRule({
  id: "named-predicates",
  options: defineRuleOptions<[NamedPredicatesOptions?]>(implementation.meta?.schema ?? [], validateOptions),
  title: "Name your predicates",
  description: DESCRIPTION,
  enforcement: {
    type: "custom-oxlint",
    configuration: "error",
    implementation,
  },
});
