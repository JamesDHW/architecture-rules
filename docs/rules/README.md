<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Rules

Each page explains one rule: why it exists, what to write instead, when a suppression is justified, known workarounds to avoid, and its test cases as examples.

| Rule | Title | Checked by | Default |
| --- | --- | --- | --- |
| [`allowed-imports`](allowed-imports.md) | Respect architectural import permissions | Custom lint rule `architecture/allowed-imports` | error by default |
| [`async-await`](async-await.md) | Use async/await for sequential asynchronous flow | Oxlint rule `promise/prefer-await-to-then` | error by default, with options `[{"strict":true}]` |
| [`await-thenable`](await-thenable.md) | Only await thenable values | Oxlint rule `typescript/await-thenable` | error by default |
| [`checked-indexed-access`](checked-indexed-access.md) | Check every indexed collection access | TypeScript compiler options `{"noUncheckedIndexedAccess":true}` |  |
| [`collection-loops`](collection-loops.md) | Use for...of as the default loop form | Custom lint rule `architecture/collection-loops` | error by default |
| [`compiler-checking`](compiler-checking.md) | Run the configured compiler without weakening its contract | Structural check; lint comments cannot suppress it |  |
| [`constants-module`](constants-module.md) | Put semantic constants in a constants module | Custom lint rule `architecture/constants-module` | error by default |
| [`control-flow-braces`](control-flow-braces.md) | Use braces except for single-line terminal guards | Custom lint rule `architecture/control-flow-braces` | error by default |
| [`destructured-props`](destructured-props.md) | Destructure component props in the parameter list | Custom lint rule `architecture/destructured-props` | error by default |
| [`direct-boolean-conditions`](direct-boolean-conditions.md) | Use strict booleans directly | Oxlint rule `typescript/no-unnecessary-boolean-literal-compare` | error by default, with options `[{"allowComparingNullableBooleansToTrue":true,"allowComparingNullableBooleansToFalse":true}]` |
| [`domain-owned-dispatch`](domain-owned-dispatch.md) | Dispatch domain actions through their owning reducer | Custom lint rule `architecture/domain-owned-dispatch` | error by default |
| [`eqeqeq`](eqeqeq.md) | Use explicit equality | Oxlint rule `eslint/eqeqeq` | error by default |
| [`exact-optional-property-types`](exact-optional-property-types.md) | Distinguish omitted properties from explicit undefined | TypeScript compiler options `{"exactOptionalPropertyTypes":true}` |  |
| [`exhaustive-deps`](exhaustive-deps.md) | Declare exhaustive effect dependencies | Oxlint rule `react/exhaustive-deps` | error by default |
| [`exhaustive-value-mappings`](exhaustive-value-mappings.md) | Use records for values and switches for behavior | Advisory; nothing checks it automatically |  |
| [`explicit-conditional-effects`](explicit-conditional-effects.md) | Use statements for conditional effects | Oxlint rule `eslint/no-unused-expressions` | error by default, with options `[{"allowShortCircuit":false,"allowTernary":false,"allowTaggedTemplates":true,"enforceForJSX":true,"ignoreDirectives":true}]` |
| [`explicit-conditions`](explicit-conditions.md) | Use explicit conditions for non-boolean values | Oxlint rule `typescript/strict-boolean-expressions` | error by default, with options `[{"allowString":false,"allowNumber":false,"allowNullableObject":false}]` |
| [`explicit-exported-return-types`](explicit-exported-return-types.md) | Type exported functions at their boundaries | Oxlint rule `typescript/explicit-module-boundary-types` | error by default, with options `[{"allowTypedFunctionExpressions":true}]` |
| [`explicit-jsx-props`](explicit-jsx-props.md) | Pass JSX props explicitly | Oxlint rule `react/jsx-props-no-spreading` | error by default, with options `[{"html":"ignore","custom":"enforce"}]` |
| [`file-classification`](file-classification.md) | Assign each source file exactly one layer | Structural check; lint comments cannot suppress it |  |
| [`file-inventory`](file-inventory.md) | Account for compiler-selected source files | Structural check; lint comments cannot suppress it |  |
| [`file-naming`](file-naming.md) | Name files after one primary concept | Custom lint rule `architecture/file-naming` | error by default |
| [`force-consistent-casing-in-file-names`](force-consistent-casing-in-file-names.md) | Match import paths to on-disk file casing | TypeScript compiler options `{"forceConsistentCasingInFileNames":true}` |  |
| [`generic-name-denylist`](generic-name-denylist.md) | Use complete, domain-specific names | Oxlint rule `eslint/id-denylist` | error by default, with options `["data","item","obj","arr","tmp"]` |
| [`grouped-logical-operators`](grouped-logical-operators.md) | Expose mixed logical operator precedence | Custom lint rule `architecture/grouped-logical-operators` | error by default |
| [`guard-clauses`](guard-clauses.md) | Use guard clauses for terminal cases | Oxlint rule `eslint/no-else-return` | off by default, with options `[{"allowElseIf":false}]` |
| [`jsx-key`](jsx-key.md) | Use stable list keys | Oxlint rule `react/jsx-key` | error by default |
| [`max-file-lines`](max-file-lines.md) | Limit source files to 200 lines | Oxlint rule `eslint/max-lines` | error by default, with options `[{"max":200,"skipBlankLines":true,"skipComments":true}]` |
| [`max-file-lines-warn`](max-file-lines-warn.md) | Warn when a source file exceeds 150 lines | Custom lint rule `architecture/max-file-lines-warn` | warn by default, with options `[{"max":150,"skipBlankLines":true,"skipComments":true}]` |
| [`module-scope-components`](module-scope-components.md) | Declare components and hooks at module scope | Oxlint rule `react/no-unstable-nested-components` | error by default |
| [`named-divisibility`](named-divisibility.md) | Name divisibility checks | Custom lint rule `architecture/named-divisibility` | error by default |
| [`named-exports`](named-exports.md) | Prefer named exports | Oxlint rule `import/no-default-export` | error by default |
| [`named-jsx-handlers`](named-jsx-handlers.md) | Name every non-pass-through React handler | Custom lint rule `architecture/named-jsx-handlers` | error by default |
| [`named-predicates`](named-predicates.md) | Name your predicates | Custom lint rule `architecture/named-predicates` | error by default |
| [`neutral-collection-results`](neutral-collection-results.md) | Use collection operations' neutral empty behavior | Oxlint rule `unicorn/no-useless-length-check` | error by default |
| [`no-array-mutation`](no-array-mutation.md) | Build new arrays instead of changing them in place | Custom lint rule `architecture/no-array-mutation` | error by default |
| [`no-binding-alias`](no-binding-alias.md) | Do not rename values through aliases | Custom lint rule `architecture/no-binding-alias` | error by default |
| [`no-boolean-cast`](no-boolean-cast.md) | Do not cast into a boolean | Oxlint rule `eslint/no-implicit-coercion` | error by default, with options `[{"boolean":true,"number":false,"string":false}]` |
| [`no-boolean-if-else`](no-boolean-if-else.md) | Pass booleans directly instead of branching | Custom lint rule `architecture/no-boolean-if-else` | error by default |
| [`no-captured-mutation`](no-captured-mutation.md) | Keep long-lived state in *.state.ts modules | Custom lint rule `architecture/no-captured-mutation` | error by default |
| [`no-collapsible-if`](no-collapsible-if.md) | Do not nest a sole if inside another if | Custom lint rule `architecture/no-collapsible-if` | error by default |
| [`no-cycle`](no-cycle.md) | Forbid circular dependencies | Oxlint rule `import/no-cycle` | error by default |
| [`no-deep-relative-imports`](no-deep-relative-imports.md) | Warn on deeply ascending relative imports | Custom lint rule `architecture/no-deep-relative-imports` | warn by default |
| [`no-duplicate-switch-cases`](no-duplicate-switch-cases.md) | Do not repeat switch case values | Oxlint rule `eslint/no-duplicate-case` | error by default |
| [`no-else`](no-else.md) | Do not use else | Custom lint rule `architecture/no-else` | error by default |
| [`no-empty-branches`](no-empty-branches.md) | Remove empty conditional branches | Custom lint rule `architecture/no-empty-branches` | error by default |
| [`no-enums`](no-enums.md) | Use literal unions instead of enums | Custom lint rule `architecture/no-enums` | error by default |
| [`no-explicit-any`](no-explicit-any.md) | Isolate unchecked type escapes at boundaries | Oxlint rule `typescript/no-explicit-any` | error by default |
| [`no-fallthrough-cases-in-switch`](no-fallthrough-cases-in-switch.md) | Do not fall through switch cases | TypeScript compiler options `{"noFallthroughCasesInSwitch":true}` |  |
| [`no-finally`](no-finally.md) | Sequence normalized operations and cleanup without finally | Custom lint rule `architecture/no-finally` | error by default |
| [`no-floating-promises`](no-floating-promises.md) | Do not ignore promises | Oxlint rule `typescript/no-floating-promises` | error by default |
| [`no-for-each`](no-for-each.md) | Do not use forEach | Oxlint rule `unicorn/no-array-for-each` | error by default |
| [`no-implicit-override`](no-implicit-override.md) | Mark override methods explicitly | TypeScript compiler options `{"noImplicitOverride":true}` |  |
| [`no-implicit-returns`](no-implicit-returns.md) | Require every code path to return | TypeScript compiler options `{"noImplicitReturns":true}` |  |
| [`no-let`](no-let.md) | Declare every binding with const | Custom lint rule `architecture/no-let` | error by default |
| [`no-loop-jumps`](no-loop-jumps.md) | Replace loop jumps with selection or focused operations | Custom lint rule `architecture/no-loop-jumps` | error by default |
| [`no-misused-promises`](no-misused-promises.md) | Do not misuse promises in conditionals or listeners | Oxlint rule `typescript/no-misused-promises` | error by default, with options `[{"checksVoidReturn":{"attributes":false}}]` |
| [`no-non-null-assertion`](no-non-null-assertion.md) | Do not use non-null assertions | Oxlint rule `typescript/no-non-null-assertion` | error by default |
| [`no-param-reassign`](no-param-reassign.md) | Do not mutate inputs | Oxlint rule `eslint/no-param-reassign` | error by default, with options `[{"props":true}]` |
| [`no-raw-exceptions`](no-raw-exceptions.md) | Confine raw exceptions to explicit adapters | Custom lint rule `architecture/no-raw-exceptions` | error by default |
| [`no-shadow`](no-shadow.md) | Do not hide a name from an enclosing scope | Oxlint rule `eslint/no-shadow` | error by default |
| [`no-ts-comments`](no-ts-comments.md) | Do not use @ts-ignore or @ts-expect-error | Oxlint rule `typescript/ban-ts-comment` | error by default, with options `[{"ts-expect-error":true,"ts-ignore":true,"ts-nocheck":true}]` |
| [`no-type-assertions`](no-type-assertions.md) | Do not use unchecked type assertions | Custom lint rule `architecture/no-type-assertions` | error by default |
| [`no-unneeded-ternary`](no-unneeded-ternary.md) | Do not use a ternary as a boolean detour | Oxlint rule `eslint/no-unneeded-ternary` | error by default |
| [`no-unreachable-statements`](no-unreachable-statements.md) | Remove unreachable statements after terminal exits | Oxlint rule `eslint/no-unreachable` | error by default |
| [`no-unsafe-argument`](no-unsafe-argument.md) | Do not pass unsafe types as arguments | Oxlint rule `typescript/no-unsafe-argument` | error by default |
| [`no-unsafe-assignment`](no-unsafe-assignment.md) | Do not assign unsafe types | Oxlint rule `typescript/no-unsafe-assignment` | error by default |
| [`no-unsafe-call`](no-unsafe-call.md) | Do not call unsafe types | Oxlint rule `typescript/no-unsafe-call` | error by default |
| [`no-unsafe-member-access`](no-unsafe-member-access.md) | Do not access members of unsafe types | Oxlint rule `typescript/no-unsafe-member-access` | error by default |
| [`no-unsafe-return`](no-unsafe-return.md) | Do not return unsafe types | Oxlint rule `typescript/no-unsafe-return` | error by default |
| [`no-unsafe-type-assertion`](no-unsafe-type-assertion.md) | Do not use narrowing type assertions | Oxlint rule `typescript/no-unsafe-type-assertion` | off by default |
| [`no-useless-assignment`](no-useless-assignment.md) | Do not keep a result for later through a detour | Oxlint rule `eslint/no-useless-assignment` | error by default |
| [`no-var`](no-var.md) | Do not use var | Oxlint rule `eslint/no-var` | error by default |
| [`nullish-defaults`](nullish-defaults.md) | Use nullish coalescing for missing-value defaults | Oxlint rule `typescript/prefer-nullish-coalescing` | error by default |
| [`one-path-one-result`](one-path-one-result.md) | Combine adjacent guards with the same terminal outcome | Custom lint rule `architecture/one-path-one-result` | warn by default |
| [`prefer-arrow-callback`](prefer-arrow-callback.md) | Prefer arrow functions for callbacks | Oxlint rule `eslint/prefer-arrow-callback` | error by default |
| [`prefer-arrow-functions`](prefer-arrow-functions.md) | Prefer arrow functions | Oxlint rule `eslint/func-style` | error by default, with options `["expression"]` |
| [`prefer-at`](prefer-at.md) | Check every indexed collection access | Oxlint rule `unicorn/prefer-at` | error by default |
| [`prefer-const`](prefer-const.md) | Keep values immutable | Oxlint rule `eslint/prefer-const` | error by default |
| [`prefer-logical-over-ternary`](prefer-logical-over-ternary.md) | Reveal logic operators | Oxlint rule `unicorn/prefer-logical-operator-over-ternary` | error by default |
| [`prefer-single-boolean-return`](prefer-single-boolean-return.md) | Return a boolean expression instead of a true/false tail | Custom lint rule `architecture/prefer-single-boolean-return` | error by default |
| [`prefer-switch`](prefer-switch.md) | Prefer switch over repeated equality ifs | Custom lint rule `architecture/prefer-switch` | error by default |
| [`preserve-cleanup-failures`](preserve-cleanup-failures.md) | Preserve operation and cleanup failures together | Advisory; nothing checks it automatically |  |
| [`project-membership`](project-membership.md) | Govern all local TypeScript program sources | Structural check; lint comments cannot suppress it |  |
| [`pure-conditions`](pure-conditions.md) | Keep conditions free of explicit effects | Custom lint rule `architecture/pure-conditions` | error by default |
| [`readonly-type-properties`](readonly-type-properties.md) | Declare data as recursively readonly | Custom lint rule `architecture/readonly-type-properties` | error by default |
| [`reasoned-suppressions`](reasoned-suppressions.md) | Keep lint exceptions narrow and explained | Structural check; lint comments cannot suppress it |  |
| [`reduce-simple-folds`](reduce-simple-folds.md) | Use reduce only for simple folds | Oxlint rule `unicorn/no-array-reduce` | error by default, with options `[{"allowSimpleOperations":true}]` |
| [`rules-of-hooks`](rules-of-hooks.md) | Follow the Rules of Hooks | Oxlint rule `react/rules-of-hooks` | error by default |
| [`scoped-case-declarations`](scoped-case-declarations.md) | Scope lexical declarations within switch cases | Oxlint rule `eslint/no-case-declarations` | error by default |
| [`simple-ternaries`](simple-ternaries.md) | Keep ternaries simple and side-effect-free | Custom lint rule `architecture/simple-ternaries` | error by default |
| [`strict-typescript`](strict-typescript.md) | Use TypeScript strict mode | TypeScript compiler options `{"strict":true}` |  |
| [`subject-first-comparisons`](subject-first-comparisons.md) | Put the comparison subject before the literal | Oxlint rule `eslint/yoda` | error by default, with options `["never",{"exceptRange":true}]` |
| [`switch-exhaustiveness`](switch-exhaustiveness.md) | Handle discriminated unions exhaustively | Oxlint rule `typescript/switch-exhaustiveness-check` | error by default, with options `[{"considerDefaultExhaustiveForUnions":false,"allowDefaultCaseForExhaustiveSwitch":true}]` |
| [`terminal-switch-cases`](terminal-switch-cases.md) | Return from switch cases in a focused operation | Custom lint rule `architecture/terminal-switch-cases` | error by default |
| [`type-aliases`](type-aliases.md) | Use type aliases for object shapes | Oxlint rule `typescript/consistent-type-definitions` | error by default, with options `["type"]` |
| [`unnecessary-conditions`](unnecessary-conditions.md) | Remove type-proven unnecessary conditions | Oxlint rule `typescript/no-unnecessary-condition` | error by default, with options `[{"checkTypePredicates":true,"allowConstantLoopConditions":"never"}]` |
