export declare const rules: readonly [{
    readonly id: "file-inventory";
    readonly title: "Account for compiler-selected source files";
    readonly description: "Inventory only source files in the configured TypeScript programs. Do not scan unrelated repository files or require allowlists for documentation, assets, configuration or build outputs. Selected source must exist on disk; selected managed symlinks and root escapes are rejected. Dependency-install libraries are not application source.";
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
    readonly description: "TypeScript owns scope through files, include, exclude, inherited configuration, allowJs, imports and configured project references. Do not reinterpret compiler globs or filter program sources afterward. Excluded files imported by selected source are still program members, exactly as in TypeScript. Files outside every configured program are not checked; configuration and generated declarations inside a program must be classified like other source.";
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
    readonly evasions: readonly [{
        readonly name: "A reason that names no cost";
        readonly code: "// oxlint-disable-next-line architecture/no-let -- needed\nlet retryCount = 0;";
        readonly why: "Any non-empty reason passes. Say concretely what complying would cost on this line, so a reviewer can judge it.";
    }];
    readonly enforcement: {
        readonly type: "architecture";
    };
}, {
    readonly id: "allowed-imports";
    readonly title: "Respect architectural import permissions";
    readonly description: string;
    readonly instead: "Import only what this file type allows (architecture-check explain <file> lists it): move the code to a file type that may import it, or inject the dependency.";
    readonly suppressWhen: "A module is loaded by a path known only at runtime, such as a plugin named in configuration.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "domain-owned-dispatch";
    readonly title: "Dispatch domain actions through their owning reducer";
    readonly description: string;
    readonly instead: "Route by an explicit domain field and let the child reducer own its action union.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "control-flow-braces";
    readonly title: "Use braces except for single-line terminal guards";
    readonly description: string;
    readonly instead: "Add braces around the body; only a single-line terminal guard such as `if (isDone) return result;` may omit them.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "neutral-collection-results";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "unicorn/no-useless-length-check";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "no-duplicate-switch-cases";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-duplicate-case";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "no-unreachable-statements";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-unreachable";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "scoped-case-declarations";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-case-declarations";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead: "Run the operation and then its cleanup through tryCatch, in sequence, and combine both results.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-raw-exceptions";
    readonly title: "Confine raw exceptions to explicit adapters";
    readonly description: string;
    readonly instead: "Return an error value; wrap a call that can throw or reject in tryCatch or tryCatchAsync, and keep raw try/throw in the error adapter.";
    readonly suppressWhen: "A framework requires a throw, such as a router redirect, at the one place it is required.";
    readonly evasions: readonly [{
        readonly name: "Leaving a rejecting call unwrapped";
        readonly code: "const loadProject = async (projectId: string): Promise<Project | ProjectError> => {\n  const response = await httpClient.get(`/projects/${projectId}`);\n  return parseProject(response.body);\n};";
        readonly why: "There is no try or throw to report, so the rule passes, but a network failure rejects past every caller that branches on returned errors. Wrap the call: await tryCatchAsync(() => httpClient.get(url)).";
    }];
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
    readonly instead: "Delete the empty branch, or return explicitly for an exhaustive no-op case.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "grouped-logical-operators";
    readonly title: "Expose mixed logical operator precedence";
    readonly description: string;
    readonly instead: "Parenthesize each && group inside an ||: isAdmin || (isOwner && isDraft).";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "collection-loops";
    readonly title: "Use for...of as the default loop form";
    readonly description: string;
    readonly instead: "Use for...of, for await...of, or a collection method such as map, filter, find or some.";
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
    readonly instead: "Replace break and continue with find, filter, some, or a helper that returns.";
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
    readonly instead: "Compute the effect into a const first, then test the const.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "terminal-switch-cases";
    readonly title: "Return from switch cases in a focused operation";
    readonly description: string;
    readonly instead: "Return from every case; move shared follow-up work into a helper the case returns.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
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
}, {
    readonly id: "simple-ternaries";
    readonly title: "Keep ternaries simple and side-effect-free";
    readonly description: string;
    readonly instead: "Use an if with return, or a named function, instead of a nested or effectful ternary.";
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
    readonly instead: "Rename the file after its one concept, in the case and with a suffix its file type allows.";
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "no-var";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-var";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "no-for-each";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "unicorn/no-array-for-each";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "named-exports";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "import/no-default-export";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "type-aliases";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/consistent-type-definitions";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, "interface" | "type"] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly options: import("../core/defineRule.js").RuleOptions<[Partial<import("./maxFileLines.constants.js").MaxFileLinesOptions>?]>;
    readonly title: "Warn when a source file exceeds 150 lines";
    readonly description: string;
    readonly instead: "Split the file by responsibility: move one cohesive concept into its own file.";
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "generic-name-denylist";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "id-denylist";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, ...string[]] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "no-non-null-assertion";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-non-null-assertion";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "no-unsafe-assignment";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-assignment";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "no-unsafe-call";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-call";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "no-unsafe-return";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-return";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "no-unsafe-argument";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-argument";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "no-unsafe-type-assertion";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/no-unsafe-type-assertion";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "no-shadow";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "no-shadow";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | readonly [import("../core/defineRule.js").Severity, {
            readonly allow?: readonly string[];
            readonly builtinGlobals?: boolean;
            readonly hoist?: "all" | "functions" | "functions-and-types" | "never" | "types";
            readonly ignoreFunctionTypeParameterNameValueShadow?: boolean;
            readonly ignoreOnInitialization?: boolean;
            readonly ignoreTypeValueShadow?: boolean;
        }] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "await-thenable";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "typescript/await-thenable";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "rules-of-hooks";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "react/rules-of-hooks";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
    readonly id: "prefer-logical-over-ternary";
    readonly title: string;
    readonly description: string;
    readonly enforcement: {
        readonly type: "oxlint";
        readonly rule: "unicorn/prefer-logical-operator-over-ternary";
        readonly configuration: (readonly [import("../core/defineRule.js").Severity] | import("../core/defineRule.js").Severity) & import("../core/defineRule.js").OxlintRuleConfiguration;
    };
}, {
    readonly instead?: string;
    readonly suppressWhen?: string;
    readonly evasions?: readonly import("../core/defineRule.js").RuleEvasion[];
} & {
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
    readonly instead: "Name the compound condition and test the name: const canEdit = isOwner || isAdmin;";
    readonly evasions: readonly [{
        readonly name: "A name that says nothing";
        readonly code: "const openProject = () => {\n  const condition = isOwner || isAdministrator;\n  if (condition) return showEditor();\n  return showViewer();\n};";
        readonly why: "The rule asks for the decision to be named; condition, check and flag name nothing. Name what is true: const canEditProject = isOwner || isAdministrator;";
    }];
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "named-divisibility";
    readonly title: "Name divisibility checks";
    readonly description: string;
    readonly instead: "Wrap the remainder test in a named predicate such as isDivisibleBy(value, divisor).";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-else";
    readonly title: "Do not use else";
    readonly description: string;
    readonly instead: "Return early for the special case and let the main path continue without else.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-collapsible-if";
    readonly title: "Do not nest a sole if inside another if";
    readonly description: string;
    readonly instead: "Merge the nested ifs into one condition, and name it when it is compound.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-boolean-if-else";
    readonly title: "Pass booleans directly instead of branching";
    readonly description: string;
    readonly instead: "Pass the boolean in directly: setVisible(isOpen), not if (isOpen) setVisible(true) else setVisible(false).";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "prefer-single-boolean-return";
    readonly title: "Return a boolean expression instead of a true/false tail";
    readonly description: string;
    readonly instead: "Return the condition itself instead of if (condition) return true; return false;";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "one-path-one-result";
    readonly title: "Combine adjacent guards with the same terminal outcome";
    readonly description: string;
    readonly instead: "Combine adjacent guards that return the same value into one named condition.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "warn";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "prefer-switch";
    readonly title: "Prefer switch over repeated equality ifs";
    readonly description: string;
    readonly instead: "Use a switch on the value, or a readonly record when each case only maps to a value.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-enums";
    readonly title: "Use literal unions instead of enums";
    readonly description: string;
    readonly instead: "Use a union of string literals instead of an enum.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
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
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "readonly-type-properties";
    readonly title: "Declare data as recursively readonly";
    readonly description: string;
    readonly instead: "Mark every property and index signature readonly.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-binding-alias";
    readonly title: "Do not rename values through aliases";
    readonly description: string;
    readonly instead: "Use the original name, or compute a genuinely new value; import names as they are exported.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-deep-relative-imports";
    readonly title: "Warn on deeply ascending relative imports";
    readonly description: string;
    readonly instead: "Import through a module alias (package exports or a #subpath import) instead of ../../../.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "warn";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "constants-module";
    readonly title: "Put semantic constants in a constants module";
    readonly description: string;
    readonly instead: "Move the SCREAMING_CASE constant into a sibling *.constants.ts module and import it.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "named-jsx-handlers";
    readonly title: "Name every non-pass-through React handler";
    readonly description: string;
    readonly instead: "Pass a named handler, or bind one with plain values: onClick={handleRemoveClick(row.id)}.";
    readonly evasions: readonly [{
        readonly name: "Passing a row's id through the DOM";
        readonly lang: "tsx";
        readonly code: "const handleRemoveClick = (event: MouseEvent<HTMLButtonElement>) => removeConnection(event.currentTarget.value);\nconst Row = ({ connection }: RowProps) => <button value={connection.id} onClick={handleRemoveClick}>Remove</button>;";
        readonly why: "A typed id becomes a string read back from the DOM. Bind the handler with the value instead: onClick={handleRemoveClick(connection.id)}.";
    }];
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
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
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-captured-mutation";
    readonly title: "Keep long-lived state in *.state.ts modules";
    readonly description: string;
    readonly instead: "Build a new value inside the function, or move long-lived state into a *.state.ts module.";
    readonly suppressWhen: "A third-party API hands you a callback that must record into state you created; prefer a *.state.ts module first.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "destructured-props";
    readonly title: "Destructure component props in the parameter list";
    readonly description: string;
    readonly instead: "Destructure the props in the parameter list: ({ title, onClose }) =>.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}, {
    readonly id: "no-array-mutation";
    readonly title: "Build new arrays instead of changing them in place";
    readonly description: string;
    readonly instead: "Build a new array with map, filter, flatMap, a spread, toSorted or Array.fromAsync instead of changing one in place.";
    readonly suppressWhen: "In-place change is measurably faster on a hot path; name the measurement in the reason.";
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: import("eslint").Rule.RuleModule;
    };
}];
export type ArchitectureRuleId = (typeof rules)[number]["id"];
//# sourceMappingURL=index.d.ts.map