import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";
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
Promises used as booleans or passed where a callback must finish synchronously
are a common source of unhandled asynchronous failures. Treat a promise as
asynchronous work, not as a value. JSX props are the exception: React ignores a
handler's return value, so an async handler may be passed directly, as in the
named-handler example.
  `.trim(),
    rule: "typescript/no-misused-promises",
    configuration: ["error", { checksVoidReturn: { attributes: false } }],
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
//# sourceMappingURL=asyncFlow.rules.js.map