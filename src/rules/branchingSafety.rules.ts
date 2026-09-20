import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";

export const explicitConditionalEffectsRule = defineNativeOxlintRule({
  id: "explicit-conditional-effects",
  title: "Use statements for conditional effects",
  description: `
Use if statements for conditional effects, not discarded logical or ternary
expressions. Reserve && and || for boolean computation and approved JSX
presence rendering; reserve ?? for missing-value defaults.

Good: if (isArchived) { sendArchiveNotification(project); }
Bad: isArchived && sendArchiveNotification(project);
Bad: isArchived ? sendArchiveNotification(project) : sendActiveNotification(project);

Native enforcement rejects discarded expressions. Ordinary calls in consumed
expressions may be pure calculations; their purity cannot be proved here.
An unused callback return does not justify hiding effects in a logical
expression. Review that case against this policy even if lint cannot infer
that a caller discards the result. Directives such as "use client" remain valid.
`.trim(),
  rule: "no-unused-expressions",
  configuration: ["error", { allowShortCircuit: false, allowTernary: false, allowTaggedTemplates: true, enforceForJSX: true, ignoreDirectives: true }],
});

export const subjectFirstComparisonsRule = defineNativeOxlintRule({
  id: "subject-first-comparisons",
  title: "Put the comparison subject before the literal",
  description: `
Good: project.status === "archived"
Bad: "archived" === project.status
Allow conventional two-sided ranges, such as 0 <= retryCount && retryCount <= 3.
Use semantic named constants when the limits express policy. Native enforcement
recognizes literals, not whether arbitrary identifiers are semantic constants.
Subject-first comparisons read as a question about the domain value; readable
range notation is an intentional exception.
`.trim(),
  rule: "yoda",
  configuration: ["error", "never", { exceptRange: true }],
});

export const unnecessaryConditionsRule = defineNativeOxlintRule({
  id: "unnecessary-conditions",
  title: "Remove type-proven unnecessary conditions",
  description: `
Reject tests that TypeScript proves cannot affect the outcome. Receive untrusted
inputs as unknown and validate at boundaries. Use a documented scoped exception
when inaccurate external declarations genuinely require a defensive check.

Good: const parseProject = (input: unknown) => validateProject(input);
Bad: const getProjectName = (project: Project) => {
  if (project === undefined) return "Unknown";
  return project.name;
};

Redundant conditions obscure contracts and suggest unsupported uncertainty.
Type proofs rely on accurate declarations; they do not validate runtime input.
`.trim(),
  rule: "typescript/no-unnecessary-condition",
  configuration: ["error", { checkTypePredicates: true, allowConstantLoopConditions: "never" }],
});

export const directBooleanConditionsRule = defineNativeOxlintRule({
  id: "direct-boolean-conditions",
  title: "Use strict booleans directly",
  description: `
Good: if (project.isArchived) { showArchiveNotice(project); }
Bad for a boolean property: if (project.isArchived === true) { showArchiveNotice(project); }
Good for a nullable property: if (project?.isArchived === true) { showArchiveNotice(); }

Use !predicate for the opposite strict-boolean case. Preserve explicit
comparisons for nullable booleans; replacing them with truthiness can lose
null/undefined distinctions. Negated exceptional guards remain preferred over
inverting the function to put its successful path inside a positive condition.
`.trim(),
  rule: "typescript/no-unnecessary-boolean-literal-compare",
  configuration: ["error", { allowComparingNullableBooleansToTrue: true, allowComparingNullableBooleansToFalse: true }],
});

export const noDuplicateSwitchCasesRule = defineNativeOxlintRule({
  id: "no-duplicate-switch-cases",
  title: "Do not repeat switch case values",
  description: "Give each case a distinct value. Good: case 'idle': return ready; case 'loading': return pending; Bad: two case 'idle' labels. A repeated case cannot select its later branch.",
  rule: "no-duplicate-case",
  configuration: "error",
});

export const noUnreachableStatementsRule = defineNativeOxlintRule({
  id: "no-unreachable-statements",
  title: "Remove unreachable statements after terminal exits",
  description: "Good: publishProject(); return; Bad: return; publishProject(); Unreachable work misrepresents the operation and often exposes an incorrectly placed exit.",
  rule: "no-unreachable",
  configuration: "error",
});

export const scopedCaseDeclarationsRule = defineNativeOxlintRule({
  id: "scoped-case-declarations",
  title: "Scope lexical declarations within switch cases",
  description: "Case braces are optional for simple returns. Good: case 'success': { const label = formatProject(project); return label; } Bad: the same lexical declaration in an unbraced case. Braces keep lexical bindings from leaking into other cases' shared scope.",
  rule: "no-case-declarations",
  configuration: "error",
});

export const neutralCollectionResultsRule = defineNativeOxlintRule({
  id: "neutral-collection-results",
  title: "Use collection operations' neutral empty behavior",
  description: `
Do not branch on emptiness merely to reproduce an operation's empty result.
Good: return projects.map(getProjectName);
Bad: if (projects.length === 0) return []; return projects.map(getProjectName);
Keep a guard that expresses different behavior, such as returning ProjectListEmptyError.

Native enforcement covers recognized useless length checks, not every adjacent
return pattern or arbitrary helper. Additional cases remain review obligations.
It is a syntax convention for standard collection methods, not proof that a
custom object with a map/filter method implements Array semantics.
`.trim(),
  rule: "unicorn/no-useless-length-check",
  configuration: "error",
});
