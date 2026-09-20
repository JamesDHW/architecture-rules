export declare const guardClausesRule: {
    readonly id: "guard-clauses";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-else-return";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowElseIf?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const explicitExportedReturnTypesRule: {
    readonly id: "explicit-exported-return-types";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/explicit-module-boundary-types";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowArgumentsExplicitlyTypedAsAny?: boolean;
            readonly allowDirectConstAssertionInArrowFunctions?: boolean;
            readonly allowHigherOrderFunctions?: boolean;
            readonly allowOverloadFunctions?: boolean;
            readonly allowTypedFunctionExpressions?: boolean;
            readonly allowedNames?: readonly string[];
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const preferArrowFunctionsRule: {
    readonly id: "prefer-arrow-functions";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "func-style";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, "declaration" | "expression"] | readonly [import("../core/defineRule.js").Severity, "declaration" | "expression", {
            readonly allowArrowFunctions?: boolean;
            readonly allowTypeAnnotation?: boolean;
            readonly overrides?: {
                readonly namedExports?: "declaration" | "expression" | "ignore";
            };
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const preferArrowCallbackRule: {
    readonly id: "prefer-arrow-callback";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "prefer-arrow-callback";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowNamedFunctions?: boolean;
            readonly allowUnboundThis?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const preferConstRule: {
    readonly id: "prefer-const";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "prefer-const";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly destructuring?: "all" | "any";
            readonly ignoreReadBeforeAssign?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noVarRule: {
    readonly id: "no-var";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-var";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noParamReassignRule: {
    readonly id: "no-param-reassign";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-param-reassign";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly ignorePropertyModificationsFor?: readonly string[];
            readonly ignorePropertyModificationsForRegex?: readonly string[];
            readonly props?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const reduceSimpleFoldsRule: {
    readonly id: "reduce-simple-folds";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "unicorn/no-array-reduce";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowSimpleOperations?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noForEachRule: {
    readonly id: "no-for-each";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "unicorn/no-array-for-each";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const preferAtRule: {
    readonly id: "prefer-at";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "unicorn/prefer-at";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly checkAllIndexAccess?: boolean;
            readonly getLastElementFunctions?: readonly string[];
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const nullishDefaultsRule: {
    readonly id: "nullish-defaults";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/prefer-nullish-coalescing";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly ignoreBooleanCoercion?: boolean;
            readonly ignoreConditionalTests?: boolean;
            readonly ignoreIfStatements?: boolean;
            readonly ignoreMixedLogicalExpressions?: boolean;
            readonly ignorePrimitives?: boolean | {
                readonly bigint?: boolean;
                readonly boolean?: boolean;
                readonly number?: boolean;
                readonly string?: boolean;
            };
            readonly ignoreTernaryTests?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const eqeqeqRule: {
    readonly id: "eqeqeq";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "eqeqeq";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, "always" | "smart"] | readonly [import("../core/defineRule.js").Severity, "always" | "smart", {
            readonly null?: "always" | "ignore" | "never";
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const asyncAwaitRule: {
    readonly id: "async-await";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "promise/prefer-await-to-then";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly strict?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const namedExportsRule: {
    readonly id: "named-exports";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "import/no-default-export";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const typeAliasesRule: {
    readonly id: "type-aliases";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/consistent-type-definitions";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, "interface" | "type"] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noCycleRule: {
    readonly id: "no-cycle";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "import/no-cycle";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowUnsafeDynamicCyclicDependency?: boolean;
            readonly ignoreExternal?: boolean;
            readonly ignoreTypes?: boolean;
            readonly maxDepth?: number;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const explicitJsxPropsRule: {
    readonly id: "explicit-jsx-props";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "react/jsx-props-no-spreading";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly custom?: "enforce" | "ignore";
            readonly exceptions?: readonly string[];
            readonly explicitSpread?: "enforce" | "ignore";
            readonly html?: "enforce" | "ignore";
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const moduleScopeComponentsRule: {
    readonly id: "module-scope-components";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "react/no-unstable-nested-components";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowAsProps?: boolean;
            readonly customValidators?: readonly string[];
            readonly propNamePattern?: string;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const genericNameDenylistRule: {
    readonly id: "generic-name-denylist";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "id-denylist";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, ...string[]] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noExplicitAnyRule: {
    readonly id: "no-explicit-any";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-explicit-any";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly fixToUnknown?: boolean;
            readonly ignoreRestArgs?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noNonNullAssertionRule: {
    readonly id: "no-non-null-assertion";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-non-null-assertion";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noTsCommentsRule: {
    readonly id: "no-ts-comments";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/ban-ts-comment";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly minimumDescriptionLength?: number;
            readonly "ts-check"?: "allow-with-description" | boolean | {
                readonly descriptionFormat?: string;
            };
            readonly "ts-expect-error"?: "allow-with-description" | boolean | {
                readonly descriptionFormat?: string;
            };
            readonly "ts-ignore"?: "allow-with-description" | boolean | {
                readonly descriptionFormat?: string;
            };
            readonly "ts-nocheck"?: "allow-with-description" | boolean | {
                readonly descriptionFormat?: string;
            };
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noUnsafeAssignmentRule: {
    readonly id: "no-unsafe-assignment";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-assignment";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noUnsafeCallRule: {
    readonly id: "no-unsafe-call";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-call";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noUnsafeMemberAccessRule: {
    readonly id: "no-unsafe-member-access";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-member-access";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowOptionalChaining?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noUnsafeReturnRule: {
    readonly id: "no-unsafe-return";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-return";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noUnsafeArgumentRule: {
    readonly id: "no-unsafe-argument";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-argument";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noUnsafeTypeAssertionRule: {
    readonly id: "no-unsafe-type-assertion";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-type-assertion";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const switchExhaustivenessRule: {
    readonly id: "switch-exhaustiveness";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/switch-exhaustiveness-check";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowDefaultCaseForExhaustiveSwitch?: boolean;
            readonly considerDefaultExhaustiveForUnions?: boolean;
            readonly defaultCaseCommentPattern?: string;
            readonly requireDefaultForNonUnion?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noFloatingPromisesRule: {
    readonly id: "no-floating-promises";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-floating-promises";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowForKnownSafeCalls?: readonly (string | {
                readonly from: "file";
                readonly name: string | readonly string[];
                readonly path?: string;
            } | {
                readonly from: "lib";
                readonly name: string | readonly string[];
            } | {
                readonly from: "package";
                readonly name: string | readonly string[];
                readonly package: string;
            })[];
            readonly allowForKnownSafePromises?: readonly (string | {
                readonly from: "file";
                readonly name: string | readonly string[];
                readonly path?: string;
            } | {
                readonly from: "lib";
                readonly name: string | readonly string[];
            } | {
                readonly from: "package";
                readonly name: string | readonly string[];
                readonly package: string;
            })[];
            readonly checkThenables?: boolean;
            readonly ignoreIIFE?: boolean;
            readonly ignoreVoid?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noMisusedPromisesRule: {
    readonly id: "no-misused-promises";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-misused-promises";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly checksConditionals?: boolean;
            readonly checksSpreads?: boolean;
            readonly checksVoidReturn?: boolean | {
                readonly arguments?: boolean;
                readonly attributes?: boolean;
                readonly inheritedMethods?: boolean;
                readonly properties?: boolean;
                readonly returns?: boolean;
                readonly variables?: boolean;
            };
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const awaitThenableRule: {
    readonly id: "await-thenable";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/await-thenable";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const rulesOfHooksRule: {
    readonly id: "rules-of-hooks";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "react/rules-of-hooks";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const exhaustiveDepsRule: {
    readonly id: "exhaustive-deps";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "react/exhaustive-deps";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly additionalHooks?: string;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const jsxKeyRule: {
    readonly id: "jsx-key";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "react/jsx-key";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly checkFragmentShorthand?: boolean;
            readonly checkKeyMustBeforeSpread?: boolean;
            readonly warnOnDuplicates?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noBooleanCastRule: {
    readonly id: "no-boolean-cast";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-implicit-coercion";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allow?: readonly string[];
            readonly boolean?: boolean;
            readonly disallowTemplateShorthand?: boolean;
            readonly number?: boolean;
            readonly string?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noUnneededTernaryRule: {
    readonly id: "no-unneeded-ternary";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-unneeded-ternary";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly defaultAssignment?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const preferLogicalOverTernaryRule: {
    readonly id: "prefer-logical-over-ternary";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "unicorn/prefer-logical-operator-over-ternary";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
export declare const noUselessAssignmentRule: {
    readonly id: "no-useless-assignment";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-useless-assignment";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
};
//# sourceMappingURL=nativeOxlint.rules.d.ts.map