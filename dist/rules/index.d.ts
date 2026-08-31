export declare const rules: readonly [{
    readonly id: "explicit-conditions";
    readonly title: "Use explicit conditions for non-boolean values";
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/strict-boolean-expressions";
        readonly configuration: readonly ["error", {
            readonly allowString: false;
            readonly allowNumber: false;
            readonly allowNullableObject: false;
        }];
    };
}, {
    readonly id: "file-naming";
    readonly title: "Name files after one primary concept";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: readonly ["error", {
            readonly allow: {
                readonly entrypoints: readonly ["**/index.ts", "**/index.tsx"];
                readonly tests: readonly ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"];
                readonly framework: readonly ["**/page.tsx", "**/layout.tsx"];
            };
        }];
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "strict-typescript";
    readonly title: "Use TypeScript strict mode";
    readonly description: string;
    readonly enforcement: {
        readonly type: "typescript";
        readonly compilerOptions: {
            readonly strict: true;
        };
    };
}, {
    readonly id: "checked-indexed-access";
    readonly title: "Check every indexed collection access";
    readonly description: string;
    readonly enforcement: {
        readonly type: "typescript";
        readonly compilerOptions: {
            readonly noUncheckedIndexedAccess: true;
        };
    };
}, {
    readonly id: "exact-optional-property-types";
    readonly title: "Distinguish omitted properties from explicit undefined";
    readonly description: string;
    readonly enforcement: {
        readonly type: "typescript";
        readonly compilerOptions: {
            readonly exactOptionalPropertyTypes: true;
        };
    };
}, {
    readonly id: "no-implicit-returns";
    readonly title: "Require every code path to return";
    readonly description: string;
    readonly enforcement: {
        readonly type: "typescript";
        readonly compilerOptions: {
            readonly noImplicitReturns: true;
        };
    };
}, {
    readonly id: "no-fallthrough-cases-in-switch";
    readonly title: "Do not fall through switch cases";
    readonly description: string;
    readonly enforcement: {
        readonly type: "typescript";
        readonly compilerOptions: {
            readonly noFallthroughCasesInSwitch: true;
        };
    };
}, {
    readonly id: "no-implicit-override";
    readonly title: "Mark override methods explicitly";
    readonly description: string;
    readonly enforcement: {
        readonly type: "typescript";
        readonly compilerOptions: {
            readonly noImplicitOverride: true;
        };
    };
}, {
    readonly id: "force-consistent-casing-in-file-names";
    readonly title: "Match import paths to on-disk file casing";
    readonly description: string;
    readonly enforcement: {
        readonly type: "typescript";
        readonly compilerOptions: {
            readonly forceConsistentCasingInFileNames: true;
        };
    };
}];
export type ArchitectureRuleId = (typeof rules)[number]["id"];
//# sourceMappingURL=index.d.ts.map