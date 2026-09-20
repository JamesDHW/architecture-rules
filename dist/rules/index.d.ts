export declare const rules: readonly [{
    readonly id: "file-inventory";
    readonly title: "Account for every project file";
    readonly description: "Scan the architecture root independently of gitignore. Permit only governed source, explicit auxiliary/tooling paths, and reasoned generated exclusions. Managed symlinks are rejected to avoid ambiguous identity and root escapes. Git metadata and dependency-install directories are infrastructure, not application code.";
    readonly enforcement: {
        readonly type: "architecture";
    };
}, {
    readonly id: "file-classification";
    readonly title: "Assign each source file exactly one architectural type";
    readonly description: "Select by root-relative path patterns minus explicit per-type exclusions. Zero or multiple matching types are errors. Naming validates after selection and never changes membership. Defaults are inherited policy, not another file type. Actual overlaps are checked on every run, not inferred by merging glob overrides.";
    readonly enforcement: {
        readonly type: "architecture";
    };
}, {
    readonly id: "project-membership";
    readonly title: "Govern all local TypeScript program sources";
    readonly description: "Resolve configured TypeScript programs and their local import-reachable sources. Code outside all configured programs must be assigned to a compiler project, not hidden by miscellaneous-file globs. Tooling exceptions are exact paths outside application programs. Generated exclusions cannot hide program source.";
    readonly enforcement: {
        readonly type: "architecture";
    };
}, {
    readonly id: "compiler-checking";
    readonly title: "Run the configured compiler without weakening its contract";
    readonly description: "Validate effective compiler settings and strict-family overrides against enabled project requirements. noCheck is forbidden. Missing projects and invalid compiler configurations are errors, never silently skipped. The architecture runner uses compiler diagnostics without emitting application artifacts.";
    readonly enforcement: {
        readonly type: "architecture";
    };
}, {
    readonly id: "reasoned-suppressions";
    readonly title: "Keep lint exceptions narrow and explained";
    readonly description: "Use named-rule disable-line or disable-next-line comments with a nonempty -- reason. Do not use file-wide disables or inline rule reconfiguration to change architecture policy. Structural checks cannot be suppressed by lint comments. The runtime also reports unused directives as errors.";
    readonly enforcement: {
        readonly type: "architecture";
    };
}, {
    readonly id: "allowed-imports";
    readonly title: "Respect architectural import permissions";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "domain-owned-dispatch";
    readonly title: "Dispatch domain actions through their owning reducer";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "control-flow-braces";
    readonly title: "Use braces except for single-line terminal guards";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "direct-boolean-conditions";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unnecessary-boolean-literal-compare";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowComparingNullableBooleansToFalse?: boolean;
            readonly allowComparingNullableBooleansToTrue?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "explicit-conditional-effects";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-unused-expressions";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowShortCircuit?: boolean;
            readonly allowTaggedTemplates?: boolean;
            readonly allowTernary?: boolean;
            readonly enforceForJSX?: boolean;
            readonly ignoreDirectives?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "neutral-collection-results";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "unicorn/no-useless-length-check";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-duplicate-switch-cases";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-duplicate-case";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-unreachable-statements";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-unreachable";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "scoped-case-declarations";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-case-declarations";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "subject-first-comparisons";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "yoda";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, "always" | "never"] | readonly [import("../core/defineRule.js").Severity, "always" | "never", {
            readonly exceptRange?: boolean;
            readonly onlyEquality?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "unnecessary-conditions";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unnecessary-condition";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allowConstantLoopConditions?: boolean | ("always" | "never" | "only-allowed-literals");
            readonly checkTypePredicates?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-finally";
    readonly title: "Sequence normalized operations and cleanup without finally";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-raw-exceptions";
    readonly title: "Confine raw exceptions to explicit adapters";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "preserve-cleanup-failures";
    readonly title: "Preserve operation and cleanup failures together";
    readonly description: string;
    readonly enforcement: {
        readonly type: "advisory";
    };
}, {
    readonly id: "exhaustive-value-mappings";
    readonly title: "Use records for values and switches for behavior";
    readonly description: string;
    readonly enforcement: {
        readonly type: "advisory";
    };
}, {
    readonly id: "no-empty-branches";
    readonly title: "Remove empty conditional branches";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "grouped-logical-operators";
    readonly title: "Expose mixed logical operator precedence";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "collection-loops";
    readonly title: "Use for...of as the default loop form";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: {
            readonly meta: {
                readonly type: "suggestion";
                readonly docs: {
                    description: string;
                };
                readonly schema: [];
                readonly messages: {
                    readonly loop: "Use for...of, for await...of, or a dedicated collection operation. Other loop forms require an explicit scoped exception. See rule collection-loops.";
                };
            };
            readonly create: (context: import("eslint").Rule.RuleContext) => {
                "ForStatement, ForInStatement, WhileStatement, DoWhileStatement"(node: import("eslint").Rule.Node): void;
            };
        };
    };
}, {
    readonly id: "no-loop-jumps";
    readonly title: "Replace loop jumps with selection or focused operations";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: {
            readonly meta: {
                readonly type: "suggestion";
                readonly docs: {
                    description: string;
                };
                readonly schema: [];
                readonly messages: {
                    readonly jump: "Use selection, a dedicated operation, or a focused helper return instead of break, continue, or labels. Preserve evaluation order; never introduce a mutable flag. See rule no-loop-jumps.";
                };
            };
            readonly create: (context: import("eslint").Rule.RuleContext) => {
                "BreakStatement, ContinueStatement, LabeledStatement"(node: import("eslint").Rule.Node): void;
            };
        };
    };
}, {
    readonly id: "pure-conditions";
    readonly title: "Keep conditions free of explicit effects";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "terminal-switch-cases";
    readonly title: "Return from switch cases in a focused operation";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
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
    readonly id: "simple-ternaries";
    readonly title: "Keep ternaries simple and side-effect-free";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "file-naming";
    readonly options: import("../core/defineRule.js").RuleOptions<[import("./fileNaming.rule.js").FileNamingOptions?]>;
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
}, {
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
}, {
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
}, {
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
}, {
    readonly id: "no-var";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-var";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
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
}, {
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
}, {
    readonly id: "no-for-each";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "unicorn/no-array-for-each";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
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
}, {
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
}, {
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
}, {
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
}, {
    readonly id: "named-exports";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "import/no-default-export";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "type-aliases";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/consistent-type-definitions";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, "interface" | "type"] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
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
}, {
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
}, {
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
}, {
    readonly id: "max-file-lines-warn";
    readonly options: import("../core/defineRule.js").RuleOptions<[Partial<import("./maxFileLines.rule.js").MaxFileLinesOptions>?]>;
    readonly title: "Warn when a source file exceeds 150 lines";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: readonly ["warn", {
            readonly max: 150;
            readonly skipBlankLines: true;
            readonly skipComments: true;
        }];
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "max-file-lines";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "max-lines";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, number | {
            readonly max?: number;
            readonly skipBlankLines?: boolean;
            readonly skipComments?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
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
}, {
    readonly id: "generic-name-denylist";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "id-denylist";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, ...string[]] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
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
}, {
    readonly id: "no-non-null-assertion";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-non-null-assertion";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
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
}, {
    readonly id: "no-unsafe-assignment";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-assignment";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-unsafe-call";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-call";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
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
}, {
    readonly id: "no-unsafe-return";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-return";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-unsafe-argument";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-argument";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-unsafe-type-assertion";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-type-assertion";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
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
}, {
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
}, {
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
}, {
    readonly id: "await-thenable";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/await-thenable";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "rules-of-hooks";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "react/rules-of-hooks";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
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
}, {
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
}, {
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
}, {
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
}, {
    readonly id: "prefer-logical-over-ternary";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "unicorn/prefer-logical-operator-over-ternary";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "no-useless-assignment";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-useless-assignment";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly id: "named-predicates";
    readonly options: import("../core/defineRule.js").RuleOptions<[import("./namedPredicates.rule.js").NamedPredicatesOptions?]>;
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
    readonly title: "Combine adjacent guards with the same terminal outcome";
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