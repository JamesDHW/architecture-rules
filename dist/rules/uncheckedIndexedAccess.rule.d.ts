export declare const uncheckedIndexedAccessRule: {
    readonly id: "checked-indexed-access";
    readonly title: "Check every indexed collection access";
    readonly description: string;
    readonly enforcement: {
        readonly type: "typescript";
        readonly compilerOptions: {
            readonly noUncheckedIndexedAccess: true;
        };
    };
};
//# sourceMappingURL=uncheckedIndexedAccess.rule.d.ts.map