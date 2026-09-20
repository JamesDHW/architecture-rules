import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";
const UNSAFE_TYPE_DESCRIPTION = `
Do not use any, non-null assertions, unchecked type assertions, @ts-ignore,
or @ts-expect-error in application code. Accept untrusted values as unknown
and validate or narrow them. If unsafe interoperability is unavoidable,
isolate it in a descriptively named boundary adapter and document the reason.

Escape hatches move type errors away from their cause and make readers trust
claims the compiler cannot verify.
`.trim();
export const guardClausesRule = defineNativeOxlintRule({
    id: "guard-clauses",
    title: "Use guard clauses for terminal cases",
    description: `
Legacy independently configurable check, disabled by default because no-else
already rejects every else branch. Avoid else after a return. Exit the conditional
flow as soon as you can. Most else blocks after a terminal statement are
superfluous.

A chain of if/else/else if keeps extra conditions in mind, especially when
nested. Reserving conditional blocks for special cases emphasises the
nominal path and makes it easier to evolve.
  `.trim(),
    rule: "no-else-return",
    configuration: ["off", { allowElseIf: false }],
});
export const explicitExportedReturnTypesRule = defineNativeOxlintRule({
    id: "explicit-exported-return-types",
    title: "Type exported functions at their boundaries",
    description: `
Add an explicit return type to every exported non-component function. Allow
TypeScript to infer return types for private helpers and inline callbacks.

Explicit boundary types make public contracts visible without burdening small
local functions.
  `.trim(),
    rule: "typescript/explicit-module-boundary-types",
    configuration: ["error", { allowTypedFunctionExpressions: true }],
});
export const preferArrowFunctionsRule = defineNativeOxlintRule({
    id: "prefer-arrow-functions",
    title: "Prefer arrow functions",
    description: `
Use arrow functions for named operations, React components, callbacks, and
closures. Use other function forms only where the language or an API requires
them.

One default function syntax reduces incidental variation, while arrow functions
also make lexical this behavior consistent and explicit.
  `.trim(),
    rule: "func-style",
    configuration: ["error", "expression"],
});
export const preferArrowCallbackRule = defineNativeOxlintRule({
    id: "prefer-arrow-callback",
    title: "Prefer arrow functions for callbacks",
    description: `
Use arrow functions for callbacks and closures. One default function syntax
reduces incidental variation, while arrow functions also make lexical this
behavior consistent and explicit.
  `.trim(),
    rule: "prefer-arrow-callback",
    configuration: "error",
});
export const preferConstRule = defineNativeOxlintRule({
    id: "prefer-const",
    title: "Keep values immutable",
    description: `
Do not reassign bindings. Callers can understand an immutable transformation
without tracking changes over time.
  `.trim(),
    rule: "prefer-const",
    configuration: "error",
});
export const noVarRule = defineNativeOxlintRule({
    id: "no-var",
    title: "Do not use var",
    description: `
Do not reassign bindings or introduce function-scoped var. Immutable const
bindings make data flow easier to follow.
  `.trim(),
    rule: "no-var",
    configuration: "error",
});
export const noParamReassignRule = defineNativeOxlintRule({
    id: "no-param-reassign",
    title: "Do not mutate inputs",
    description: `
Do not mutate inputs, shared state, or previously observable values. Local
mutation may construct a fresh, unaliased result inside a focused helper when
that is clearer than an immutable accumulator.
  `.trim(),
    rule: "no-param-reassign",
    configuration: ["error", { props: true }],
});
export const reduceSimpleFoldsRule = defineNativeOxlintRule({
    id: "reduce-simple-folds",
    title: "Use reduce only for simple folds",
    description: `
Use reduce only when the result is genuinely a single simple fold, such as a
sum, minimum, or maximum. Use dedicated operations such as map, filter, or a
descriptively named helper for transformation, selection, grouping, indexing,
and multi-purpose accumulation.

General accumulators force readers to simulate each iteration and track the
accumulator's shape.
  `.trim(),
    rule: "unicorn/no-array-reduce",
    configuration: ["error", { allowSimpleOperations: true }],
});
export const noForEachRule = defineNativeOxlintRule({
    id: "no-for-each",
    title: "Do not use forEach",
    description: `
Use map, filter, or another dedicated transformation for direct value
transformations. Use for...of when intentionally sequencing effects. Do not
use forEach, including with asynchronous callbacks.

The iteration form should reveal whether code directly transforms data,
constructs a result, or performs effects. forEach discards callback results
and misleadingly accepts async callbacks without awaiting them.
  `.trim(),
    rule: "unicorn/no-array-for-each",
    configuration: "error",
});
export const preferAtRule = defineNativeOxlintRule({
    id: "prefer-at",
    title: "Check every indexed collection access",
    description: `
Treat array, tuple, and record lookup results as possibly undefined unless the
type system proves that the key exists. Prefer .at() for index access so
absence is part of the result.

Runtime collections do not guarantee that an index or key exists.
  `.trim(),
    rule: "unicorn/prefer-at",
    configuration: "error",
});
export const nullishDefaultsRule = defineNativeOxlintRule({
    id: "nullish-defaults",
    title: "Use nullish coalescing for missing-value defaults",
    description: `
Use ?? when supplying a fallback for missing data. Do not use || for value
defaulting; reserve it for boolean logic.

Nullish coalescing states that only null or undefined is missing and preserves
intentional values such as an empty string, zero, and false.

Good: const displayName = suppliedName ?? "Anonymous";
Bad: const displayName = isNullish(suppliedName) ? "Anonymous" : suppliedName;

Explicit branches remain appropriate when null and undefined mean different
things. Empty-string fallback is a named policy, not implicit truthiness.
Native enforcement may not recognize project-specific guard calls; review
those redundant helper-based ternaries against the same policy.
  `.trim(),
    rule: "typescript/prefer-nullish-coalescing",
    configuration: "error",
});
export const eqeqeqRule = defineNativeOxlintRule({
    id: "eqeqeq",
    title: "Use explicit equality",
    description: `
Only boolean-typed expressions may be tested directly. Compare values
explicitly according to the intended condition rather than relying on
JavaScript coercion.
  `.trim(),
    rule: "eqeqeq",
    configuration: "error",
});
export const asyncAwaitRule = defineNativeOxlintRule({
    id: "async-await",
    title: "Use async/await for sequential asynchronous flow",
    description: `
Express sequential asynchronous work with async/await, not .then, .catch, or
.finally. Ban those methods even after an await or yield. Use explicit Promise
combinators such as Promise.all when intentional concurrency is the operation
being expressed.

async/await presents asynchronous control flow in the same readable sequence as
synchronous code.
  `.trim(),
    rule: "promise/prefer-await-to-then",
    configuration: ["error", { strict: true }],
});
export const namedExportsRule = defineNativeOxlintRule({
    id: "named-exports",
    title: "Prefer named exports",
    description: `
Use named exports wherever the surrounding framework permits them. Use a
default export only when a framework requires one.

Named exports keep identifiers consistent between their definitions and
imports, which makes references easier to search, navigate, and refactor.
  `.trim(),
    rule: "import/no-default-export",
    configuration: "error",
});
export const typeAliasesRule = defineNativeOxlintRule({
    id: "type-aliases",
    title: "Use type aliases for object shapes",
    description: `
Use type aliases for object shapes as well as unions, functions, and composed
types. Use an interface only at a boundary where a third-party API requires
declaration or module augmentation.

One type-definition syntax removes an arbitrary choice and composes
consistently with unions.
  `.trim(),
    rule: "typescript/consistent-type-definitions",
    configuration: ["error", "type"],
});
export const noCycleRule = defineNativeOxlintRule({
    id: "no-cycle",
    title: "Forbid circular dependencies",
    description: `
Keep file and package dependency graphs acyclic. If two modules depend on each
other, extract the shared concept or reverse an effectful dependency through an
injected capability rather than retaining the cycle.

A cycle makes neither module independently understandable and obscures
initialization order.
  `.trim(),
    rule: "import/no-cycle",
    configuration: "error",
});
export const explicitJsxPropsRule = defineNativeOxlintRule({
    id: "explicit-jsx-props",
    title: "Pass JSX props explicitly",
    description: `
List application-component props explicitly at the call site rather than
spreading an object. Prop spreading is allowed only inside a low-level
pass-through primitive whose explicit purpose is forwarding native attributes.

Explicit props expose a component's inputs where it is used and prevent
unrelated object fields from silently becoming part of the call.
  `.trim(),
    rule: "react/jsx-props-no-spreading",
    configuration: ["error", { html: "ignore", custom: "enforce" }],
});
export const moduleScopeComponentsRule = defineNativeOxlintRule({
    id: "module-scope-components",
    title: "Declare components and hooks at module scope",
    description: `
Do not define a React component or hook inside another function. Declare it at
module scope and pass every required value through explicit props or hook
inputs.

Nested component declarations recreate component identity during rendering.
  `.trim(),
    rule: "react/no-unstable-nested-components",
    configuration: "error",
});
export const genericNameDenylistRule = defineNativeOxlintRule({
    id: "generic-name-denylist",
    title: "Use complete, domain-specific names",
    description: `
Name values by their domain role using complete words. Do not use generic
placeholders such as data, item, obj, arr, or tmp.

Specific names carry context into every use and remove the need to inspect a
declaration to infer what a generic placeholder represents.
  `.trim(),
    rule: "id-denylist",
    configuration: ["error", "data", "item", "obj", "arr", "tmp"],
});
export const noExplicitAnyRule = defineNativeOxlintRule({
    id: "no-explicit-any",
    title: "Isolate unchecked type escapes at boundaries",
    description: UNSAFE_TYPE_DESCRIPTION,
    rule: "typescript/no-explicit-any",
    configuration: "error",
});
export const noNonNullAssertionRule = defineNativeOxlintRule({
    id: "no-non-null-assertion",
    title: "Do not use non-null assertions",
    description: UNSAFE_TYPE_DESCRIPTION,
    rule: "typescript/no-non-null-assertion",
    configuration: "error",
});
export const noTsCommentsRule = defineNativeOxlintRule({
    id: "no-ts-comments",
    title: "Do not use @ts-ignore or @ts-expect-error",
    description: UNSAFE_TYPE_DESCRIPTION,
    rule: "typescript/ban-ts-comment",
    configuration: [
        "error",
        {
            "ts-expect-error": true,
            "ts-ignore": true,
            "ts-nocheck": true,
        },
    ],
});
export const noUnsafeAssignmentRule = defineNativeOxlintRule({
    id: "no-unsafe-assignment",
    title: "Do not assign unsafe types",
    description: UNSAFE_TYPE_DESCRIPTION,
    rule: "typescript/no-unsafe-assignment",
    configuration: "error",
});
export const noUnsafeCallRule = defineNativeOxlintRule({
    id: "no-unsafe-call",
    title: "Do not call unsafe types",
    description: UNSAFE_TYPE_DESCRIPTION,
    rule: "typescript/no-unsafe-call",
    configuration: "error",
});
export const noUnsafeMemberAccessRule = defineNativeOxlintRule({
    id: "no-unsafe-member-access",
    title: "Do not access members of unsafe types",
    description: UNSAFE_TYPE_DESCRIPTION,
    rule: "typescript/no-unsafe-member-access",
    configuration: "error",
});
export const noUnsafeReturnRule = defineNativeOxlintRule({
    id: "no-unsafe-return",
    title: "Do not return unsafe types",
    description: UNSAFE_TYPE_DESCRIPTION,
    rule: "typescript/no-unsafe-return",
    configuration: "error",
});
export const noUnsafeArgumentRule = defineNativeOxlintRule({
    id: "no-unsafe-argument",
    title: "Do not pass unsafe types as arguments",
    description: UNSAFE_TYPE_DESCRIPTION,
    rule: "typescript/no-unsafe-argument",
    configuration: "error",
});
export const noUnsafeTypeAssertionRule = defineNativeOxlintRule({
    id: "no-unsafe-type-assertion",
    title: "Do not use unsafe type assertions",
    description: UNSAFE_TYPE_DESCRIPTION,
    rule: "typescript/no-unsafe-type-assertion",
    configuration: "error",
});
export const switchExhaustivenessRule = defineNativeOxlintRule({
    id: "switch-exhaustiveness",
    title: "Handle discriminated unions exhaustively",
    description: `
Complete dispatches over a discriminated union must prove at compile time
that all variants are handled. A targeted narrowing if that intentionally
handles only one variant remains allowed; it is not a complete dispatch.

For a closed-domain default, use return request satisfies never or return a
helper call whose parameter is never. Do not use a generic error fallback
that accepts newly added variants. Open string/number domains may have a
meaningful fallback; validate untrusted values before closed-domain dispatch.

Good: default: return request satisfies never;
Bad: default: return new UnsupportedRequestError();

Native enforcement verifies missing union cases even when a default exists.
It does not require an explicit never default or prove a helper's parameter
contract; those parts remain review obligations checked with TypeScript.

Exhaustiveness turns additions to a state model into useful compiler errors at
every affected decision point.
  `.trim(),
    rule: "typescript/switch-exhaustiveness-check",
    configuration: [
        "error",
        {
            considerDefaultExhaustiveForUnions: false,
            allowDefaultCaseForExhaustiveSwitch: true,
        },
    ],
});
export const noFloatingPromisesRule = defineNativeOxlintRule({
    id: "no-floating-promises",
    title: "Do not ignore promises",
    description: `
Floating promises hide failures and make asynchronous control flow harder to
follow. Await, return, or explicitly void a promise at the point it is created.
  `.trim(),
    rule: "typescript/no-floating-promises",
    configuration: "error",
});
export const noMisusedPromisesRule = defineNativeOxlintRule({
    id: "no-misused-promises",
    title: "Do not misuse promises in conditionals or listeners",
    description: `
Promises used as booleans or event handlers are a common source of unhandled
asynchronous failures. Treat a promise as asynchronous work, not as a value.
  `.trim(),
    rule: "typescript/no-misused-promises",
    configuration: "error",
});
export const awaitThenableRule = defineNativeOxlintRule({
    id: "await-thenable",
    title: "Only await thenable values",
    description: `
Awaiting a non-promise is either a mistake or hides that the callee is
synchronous. Only await values that are actually thenable.
  `.trim(),
    rule: "typescript/await-thenable",
    configuration: "error",
});
export const rulesOfHooksRule = defineNativeOxlintRule({
    id: "rules-of-hooks",
    title: "Follow the Rules of Hooks",
    description: `
Hooks must run in the same order on every render. Conditional or nested hook
calls create state that cannot be understood or reproduced reliably.
  `.trim(),
    rule: "react/rules-of-hooks",
    configuration: "error",
});
export const exhaustiveDepsRule = defineNativeOxlintRule({
    id: "exhaustive-deps",
    title: "Declare exhaustive effect dependencies",
    description: `
Effect and memoization dependency lists that omit reactive values hide stale
closures and missed updates. List every value the callback closes over.
  `.trim(),
    rule: "react/exhaustive-deps",
    configuration: "error",
});
export const jsxKeyRule = defineNativeOxlintRule({
    id: "jsx-key",
    title: "Use stable list keys",
    description: `
List items need a stable key so React can reconcile identity across renders.
Missing or index keys cause subtle state bugs when the list changes.
  `.trim(),
    rule: "react/jsx-key",
    configuration: "error",
});
export const noBooleanCastRule = defineNativeOxlintRule({
    id: "no-boolean-cast",
    title: "Do not cast into a boolean",
    description: `
Casting to boolean, implicitly or explicitly, hides the intended condition.
Truthiness is not consistent across languages and runtimes, which leads to
unwanted results.

Compare the value according to the intended condition. Do not coerce with
!! or Boolean().
  `.trim(),
    rule: "no-implicit-coercion",
    configuration: [
        "error",
        { boolean: true, number: false, string: false },
    ],
});
export const noUnneededTernaryRule = defineNativeOxlintRule({
    id: "no-unneeded-ternary",
    title: "Do not use a ternary as a boolean detour",
    description: `
Do not use an intermediary expression to keep a boolean for later. A ternary
that only produces true or false from a condition is a detour.

Stopping the flow instead of accumulating conversions prevents unwanted
behaviour during a change.
  `.trim(),
    rule: "no-unneeded-ternary",
    configuration: "error",
});
export const preferLogicalOverTernaryRule = defineNativeOxlintRule({
    id: "prefer-logical-over-ternary",
    title: "Reveal logic operators",
    description: `
Do not hide simple || or && operations inside a ternary that repeats one of
its branches. Prefer the logical operator so the combination is visible.

A ternary of the form a ? a : b or a ? b : a is a disguised || or &&.
  `.trim(),
    rule: "unicorn/prefer-logical-operator-over-ternary",
    configuration: "error",
});
export const noUselessAssignmentRule = defineNativeOxlintRule({
    id: "no-useless-assignment",
    title: "Do not keep a result for later through a detour",
    description: `
Do not use an intermediary variable to keep a result for later when the value
can be used now. Assignments that are overwritten before they are read make
the flow rely on state that a later change can corrupt.

Return or pass the value at the point it is known.
  `.trim(),
    rule: "no-useless-assignment",
    configuration: "error",
});
//# sourceMappingURL=nativeOxlint.rules.js.map