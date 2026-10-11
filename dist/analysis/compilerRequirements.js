import { rules } from "../rules/index.js";
/** Strict-family flags that an explicit false weakens even while strict is true. */
const strictFamilyFlags = [
    "noImplicitAny", "noImplicitThis", "strictNullChecks", "strictFunctionTypes", "strictBindCallApply",
    "strictPropertyInitialization", "strictBuiltinIteratorReturn", "alwaysStrict", "useUnknownInCatchVariables",
];
const describeValue = (value) => value === undefined ? "unset" : JSON.stringify(value);
const ruleIssues = (rule, project, options) => {
    const { enforcement } = rule;
    if (enforcement.type !== "typescript")
        return [];
    const mismatches = Object.entries(enforcement.compilerOptions).filter(([key, expected]) => options[key] !== expected);
    const weakened = rule.id === "strict-typescript" ? strictFamilyFlags.filter((key) => options[key] === false) : [];
    return [
        ...mismatches.map(([key, expected]) => ({
            ruleId: rule.id,
            file: project,
            message: `Expected effective compilerOptions.${key} = ${JSON.stringify(expected)}; received ${describeValue(options[key])}. Extend architecture-rules/tsconfig or set it explicitly.`,
        })),
        ...weakened.map((key) => ({ ruleId: rule.id, file: project, message: `Explicit ${key}: false weakens strict mode.` })),
    ];
};
/** Effective compiler settings a project must keep, given the rules the architecture leaves on. */
export const compilerIssues = (architecture, project, options) => [
    ...rules
        .filter((rule) => architecture.defaults.rules[rule.id]?.severity !== "off")
        .flatMap((rule) => ruleIssues(rule, project, options)),
    ...(options.noCheck === true ? [{ ruleId: "compiler-checking", file: project, message: "noCheck disables required TypeScript verification." }] : []),
];
//# sourceMappingURL=compilerRequirements.js.map