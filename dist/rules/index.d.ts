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
        readonly configuration: "error";
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
}, {
    readonly id: "guard-clauses";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "simple-ternaries";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "explicit-exported-return-types";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "prefer-arrow-functions";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "prefer-arrow-callback";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "prefer-const";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-var";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-param-reassign";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "reduce-simple-folds";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-for-each";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "prefer-at";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "nullish-defaults";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "eqeqeq";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "async-await";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "named-exports";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "type-aliases";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-cycle";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "explicit-jsx-props";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "module-scope-components";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "max-file-lines";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "generic-name-denylist";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-explicit-any";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-non-null-assertion";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-ts-comments";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-unsafe-assignment";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-unsafe-call";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-unsafe-member-access";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-unsafe-return";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-unsafe-argument";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-unsafe-type-assertion";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "switch-exhaustiveness";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-floating-promises";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-misused-promises";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "await-thenable";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "rules-of-hooks";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "exhaustive-deps";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "jsx-key";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-boolean-cast";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-unneeded-ternary";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "prefer-logical-over-ternary";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-useless-assignment";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: string;
        readonly configuration: import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "named-predicates";
    readonly title: "Name your predicates";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "named-divisibility";
    readonly title: "Name divisibility checks";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-else";
    readonly title: "Do not use else";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-collapsible-if";
    readonly title: "Do not nest a sole if inside another if";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-boolean-if-else";
    readonly title: "Pass booleans directly instead of branching";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-boolean-assignment-branches";
    readonly title: "Do not assign boolean literals in branches";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "prefer-single-boolean-return";
    readonly title: "Return a boolean expression instead of a true/false tail";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "one-path-one-result";
    readonly title: "One path should produce one result";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "warn";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "prefer-switch";
    readonly title: "Prefer switch over repeated equality ifs";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-enums";
    readonly title: "Use literal unions instead of enums";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-type-assertions";
    readonly title: "Do not use unchecked type assertions";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "readonly-type-properties";
    readonly title: "Declare data as recursively readonly";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-binding-alias";
    readonly title: "Do not rename values through aliases";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-deep-relative-imports";
    readonly title: "Warn on deeply ascending relative imports";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "warn";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "constants-module";
    readonly title: "Put semantic constants in a constants module";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "named-jsx-handlers";
    readonly title: "Name every non-pass-through React handler";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}];
export type ArchitectureRuleId = (typeof rules)[number]["id"];
//# sourceMappingURL=index.d.ts.map