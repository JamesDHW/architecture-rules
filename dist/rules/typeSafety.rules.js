import { defineNativeOxlintRule } from "./defineNativeOxlintRule.js";
const DESCRIPTION = `
Do not use any, non-null assertions, unchecked type assertions, @ts-ignore,
or @ts-expect-error in application code. Accept untrusted values as unknown
and validate or narrow them. If unsafe interoperability is unavoidable,
isolate it in a descriptively named boundary adapter and document the reason.

Escape hatches move type errors away from their cause and make readers trust
claims the compiler cannot verify.
`.trim();
export const noExplicitAnyRule = defineNativeOxlintRule({
    id: "no-explicit-any",
    title: "Isolate unchecked type escapes at boundaries",
    description: DESCRIPTION,
    instead: "Use unknown and validate or narrow the value.",
    rule: "typescript/no-explicit-any",
    configuration: "error",
});
export const noNonNullAssertionRule = defineNativeOxlintRule({
    id: "no-non-null-assertion",
    title: "Do not use non-null assertions",
    description: DESCRIPTION,
    instead: "Handle the missing case with a guard or ?? instead of asserting with !.",
    rule: "typescript/no-non-null-assertion",
    configuration: "error",
});
export const noTsCommentsRule = defineNativeOxlintRule({
    id: "no-ts-comments",
    title: "Do not use @ts-ignore or @ts-expect-error",
    description: DESCRIPTION,
    instead: "Fix the type error, or validate the value, instead of silencing the compiler.",
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
    description: DESCRIPTION,
    instead: "Validate or narrow the any value to a known type before assigning it.",
    rule: "typescript/no-unsafe-assignment",
    configuration: "error",
});
export const noUnsafeCallRule = defineNativeOxlintRule({
    id: "no-unsafe-call",
    title: "Do not call unsafe types",
    description: DESCRIPTION,
    instead: "Validate or narrow the any value to a known function type before calling it.",
    rule: "typescript/no-unsafe-call",
    configuration: "error",
});
export const noUnsafeMemberAccessRule = defineNativeOxlintRule({
    id: "no-unsafe-member-access",
    title: "Do not access members of unsafe types",
    description: DESCRIPTION,
    instead: "Validate or narrow the any value to a known type before reading its members.",
    rule: "typescript/no-unsafe-member-access",
    configuration: "error",
});
export const noUnsafeReturnRule = defineNativeOxlintRule({
    id: "no-unsafe-return",
    title: "Do not return unsafe types",
    description: DESCRIPTION,
    instead: "Validate or narrow the any value to the declared return type before returning it.",
    rule: "typescript/no-unsafe-return",
    configuration: "error",
});
export const noUnsafeArgumentRule = defineNativeOxlintRule({
    id: "no-unsafe-argument",
    title: "Do not pass unsafe types as arguments",
    description: DESCRIPTION,
    instead: "Validate or narrow the any value to the parameter's type before passing it.",
    rule: "typescript/no-unsafe-argument",
    configuration: "error",
});
export const noUnsafeTypeAssertionRule = defineNativeOxlintRule({
    id: "no-unsafe-type-assertion",
    title: "Do not use narrowing type assertions",
    description: `
Off by default: no-type-assertions already rejects every assertion, so this
rule would only report the same casts a second time. Enable it in a layer
that relaxes no-type-assertions (for example a boundary adapter) to keep
rejecting the unsafe subset: assertions that narrow a value to a type the
compiler cannot verify.

Escape hatches move type errors away from their cause and make readers trust
claims the compiler cannot verify.
  `.trim(),
    instead: "Validate the value instead of asserting a narrower type.",
    rule: "typescript/no-unsafe-type-assertion",
    configuration: "off",
});
//# sourceMappingURL=typeSafety.rules.js.map