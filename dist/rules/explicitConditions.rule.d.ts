export declare const explicitConditionsRule: {
    readonly id: "explicit-conditions";
    readonly title: "Use explicit conditions for non-boolean values";
    readonly description: string;
    readonly instead: "Compare explicitly: name.length > 0, count !== 0, project !== undefined.";
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/strict-boolean-expressions";
        readonly configuration: readonly ["error", {
            readonly allowString: false;
            readonly allowNumber: false;
            readonly allowNullableObject: false;
        }];
    };
};
//# sourceMappingURL=explicitConditions.rule.d.ts.map