import type { Rule } from "eslint";
export declare const noTypeAssertionsRule: {
    readonly id: "no-type-assertions";
    readonly title: "Do not use unchecked type assertions";
    readonly description: string;
    readonly instead: "Validate or narrow the value with a type guard, a schema parse or satisfies, instead of asserting its type.";
    readonly suppressWhen: "Attaching a brand to a value that is already validated, or bridging two third-party types that are the same at runtime.";
    readonly evasions: readonly [{
        readonly name: "A type guard that only claims the type";
        readonly code: "const isProject = (value: unknown): value is Project => typeof value === \"object\";";
        readonly why: "The predicate asserts the type without checking its fields, so the cast has only moved. Check every field the type promises, or parse the value with a schema.";
    }];
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=noTypeAssertions.rule.d.ts.map