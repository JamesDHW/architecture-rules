import type { Rule } from "eslint";
export declare const noLetRule: {
    readonly id: "no-let";
    readonly title: "Declare every binding with const";
    readonly description: string;
    readonly instead: "Declare with const and compute a new value; keep long-lived state in a *.state.ts module.";
    readonly evasions: readonly [{
        readonly name: "An array used as a variable";
        readonly code: "const createRetrier = () => {\n  const attempts: number[] = [];\n  return () => {\n    attempts.push(1);\n    return attempts.length;\n  };\n};";
        readonly why: "The count is still mutable state shared between calls, only hidden in an array. Pass the count as a parameter, or keep the state in a *.state.ts module.";
        readonly caughtBy: "no-captured-mutation";
    }, {
        readonly name: "An object used as a variable";
        readonly code: "const createCounter = () => {\n  const counter = { value: 0 };\n  return () => {\n    counter.value += 1;\n    return counter.value;\n  };\n};";
        readonly why: "Moving the reassignment onto a property keeps the same mutable state. Compute a new value, or keep long-lived state in a *.state.ts module.";
        readonly caughtBy: "no-captured-mutation";
    }];
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noLet.rule.d.ts.map