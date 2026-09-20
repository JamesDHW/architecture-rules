# Plan: type-safe executable architecture definitions

## 1. Goal and agreed decisions

Replace the current lint-config wrapper with `defineArchitecture(config)`: a project-owned contract governing source classification, filenames, imports, and the existing rule profile, checked through one CLI.

Agreed in discussion:

- Implement the architecture framework first. New mutation/effect analysis is a follow-up, not part of this implementation.
- `architecture.config.ts` is required. Replace the public `createConfig` API and the CLI's no-config fallback; this is an intentional breaking change.
- Scan the project root, not only lint-selected source files. Require explicit allowances for non-source files and explicit generated/output exclusions.
- Use TypeScript configurations as the source of truth for TypeScript project membership. Do not maintain a second architecture `include` for TS projects.
- Every governed source file must match exactly one consumer-defined file type. Zero matches and multiple matches are errors, even if matching policies are identical.
- Match files using path patterns only. Naming is validation after selection, never a selection condition or fallback mechanism.
- Common defaults are inherited policy, not a matching file type.
- Imports are denied unless explicitly allowed. A missing import policy is valid and means no imports, unless a defaults policy is inherited.
- Keep `defineRule` as the canonical source of rule IDs, explanations, enforcement, configuration contracts, and defaults.
- Approval for architecture/package changes is provided externally by the user/agent harness. Do not implement approval records, package management, dependency approval, or config-tampering enforcement.
- Narrow inline lint suppressions with reasons remain possible. They must not exempt file inventory/classification or compiler configuration checks.
- Do not install dependencies without separate approval.

## 2. Current repository and migration implications

Inspected implementation:

- `src/core/defineRule.ts` supports native Oxlint, custom Oxlint, TypeScript, and advisory enforcement. Rule option payloads currently use `unknown[]`; personal IDs are inferred but their options are not keyed/type-safe.
- `src/core/createConfig.ts` applies global and overlapping glob overrides. Unknown IDs in runtime overrides can be silently ignored. Reasons are discarded when emitting Oxlint config.
- `src/rules/fileNaming.rule.ts` has consumer-supplied suffix/case policies and naming bypass groups. Unmatched suffixes are allowed. It does not classify architectural roles.
- `src/cli.ts` always loads the package's bundled Oxlint config, lints `.`, then optionally runs TypeScript against a root tsconfig. Missing tsconfig currently causes a skip. Compiler flags are derived from the registry and forced on the command line.
- `src/generateTsconfig.ts` generates the published `tsconfig.base.json` from TypeScript-backed rules.
- `src/index.ts`, `src/plugin.ts`, and `src/oxlint.config.ts` expose the current public API and plugin.
- `dist/` is deliberately committed and must be rebuilt with changes.
- TypeScript is 7.0.2. Do not assume the TypeScript 5/6 compiler API is available: inspect the installed package's supported/unstable APIs before designing resolution code.
- Existing custom tests use Oxlint RuleTester; ESLint-compatible integration tests are also present.

Known environment limitations from prior validation:

- pnpm command shims in the mounted `node_modules/.bin` have produced permission errors. Direct Node invocation of the installed compiler/test entry points worked.
- Oxlint RuleTester has failed allocating its large raw-transfer buffer, including for pre-existing tests. Do not interpret these failures as rule regressions or claim the full suite passed. Run full native integration tests in a suitable environment before release.

## 3. Proposed public configuration

Use a single `defaults` block rather than both root `rules` and `default.rules` spellings. File-type policies inherit this block. All patterns are relative to the architecture project root, using normalized `/` paths.

Illustrative target API (to be implemented, not existing API):

```ts
import { defineArchitecture } from "architecture-rules";

export default defineArchitecture({
  projects: {
    tsconfigs: ["tsconfig.json"],
    references: "follow",
  },

  files: {
    otherFiles: [
      "architecture.config.ts",
      "package.json",
      "pnpm-lock.yaml",
      "tsconfig*.json",
      "README.md",
      ".gitignore",
      "public/**/*.{svg,png,ico}",
    ],
    generated: [
      {
        files: ["dist/**"],
        reason: "Compiler output; checked through its source project.",
      },
    ],
  },

  defaults: {
    naming: { case: "camel" },
    rules: {
      "max-file-lines": ["error", { max: 300 }],
    },
    // No imports policy: imports are denied by default.
  },

  fileTypes: {
    domain: {
      description: "Business models and pure decisions.",
      files: ["src/features/*/domain/**/*.ts"],
      imports: {
        internal: ["domain", "contracts"],
      },
    },

    contracts: {
      description: "Validated external message contracts.",
      files: ["src/features/*/contracts/**/*.ts"],
      imports: {
        internal: ["contracts"],
        external: ["zod"],
      },
    },

    component: {
      description: "Presentation from props.",
      files: ["src/features/*/ui/**/*.tsx"],
      naming: { case: "pascal" },
      imports: {
        internal: ["component", "domain", "contracts"],
        external: ["react", "react/jsx-runtime"],
        assets: ["public/**/*.svg"],
      },
    },

    controller: {
      description: "React lifecycle and state coordination.",
      files: ["src/features/*/controllers/**/*.ts"],
      naming: { case: "camel", prefix: "use" },
      imports: {
        internal: ["controller", "domain", "contracts", "adapter"],
        external: ["react"],
      },
    },

    adapter: {
      description: "Integration with external systems.",
      files: ["src/features/*/adapters/**/*.ts"],
      imports: {
        internal: ["domain", "contracts", "adapter"],
        external: ["@example/client", "@example/client/**"],
      },
      rules: {
        "max-file-lines": {
          severity: "warn",
          reason: "Migration allowance for existing integration modules.",
        },
      },
    },

    entry: {
      description: "Application wiring and framework entry points.",
      files: ["src/main.tsx"],
      imports: {
        internal: ["component", "controller", "adapter"],
        external: ["react", "react-dom/client"],
      },
    },
  },
});
```

Example annotations:

- Layout, casing, packages, file types, generated paths, and non-source permissions are project choices, not built-in defaults.
- These role descriptions express architectural intent; v1 does not prove purity or implement a new mutation rule.
- Installed package approval and permission to import a package from a role are separate. Only the latter is enforced here.
- Tests must receive a file type if included as source. Avoid a broad production glob overlapping colocated tests; support positive `files` plus explicit per-type `exclude` patterns.
- This sample assumes a TS configuration covering the shown source locations. Supporting tools/tests outside that configuration requires another configured TS project, not silently ignoring them.

## 4. Defaults and override semantics

Resolution order:

1. Canonical rule defaults from the registry.
2. `defaults` policy.
3. Exactly one matching file-type policy.
4. Supported line-level lint suppression, where applicable.

Do not offer arbitrary ordered glob rule overrides in the architecture API.

Policy merging is deliberately shallow and documented:

- Rule maps combine by stable personal ID.
- A severity-only setting retains the effective inherited options.
- A setting containing explicit options replaces the entire inherited options tuple. Rule schema defaults fill omitted fields; no recursive merge with parent options.
- `naming` replaces the inherited naming object when supplied.
- `imports` replaces the inherited imports object when supplied. Missing lists inside that object mean empty lists, not inheritance.
- An omitted `imports` object inherits defaults. With no inherited object, all lists are empty.
- `files`, `exclude`, and descriptions do not inherit between file types.
- Reasons are retained in normalized configuration and diagnostics/explain output, even if omitted from emitted Oxlint syntax.
- No default folder scheme, casing, suffix scheme, role-name enum, or role-based automatic permissions.

Structural guarantees (classification, invalid configuration, and inventory coverage) are mandatory, not severity-overridable lint rules.

## 5. Type-safe API and rule contracts

### 5.1 Infer file-type keys without widening

`defineArchitecture` must infer literal keys from `fileTypes` and constrain `imports.internal` in defaults and file types to those keys. `"domian"` must be a compile-time error, including when nested inside an otherwise inferred object.

Use a const-generic API and mapped contextual types. Prototype inference with compile-only fixtures before committing to an implementation signature. Avoid a catch-all `Record<string, unknown>`/`any` overload that admits invalid configurations.

Also validate references at runtime for JavaScript callers, dynamic inputs, and assertions bypassing TS.

### 5.2 Key rule settings by rule ID and option tuple

Derive a typed registry map rather than maintaining an unrelated list of option types:

```ts
// Conceptual shapes; final generics must preserve contextual inference.
type Severity = "off" | "warn" | "error";

type RuleSetting<Options extends readonly unknown[]> =
  | Severity
  | readonly [Severity, ...Options]
  | {
      readonly severity?: Severity;
      readonly options?: Options;
      readonly reason: string;
    };
```

Use native option tuples as the canonical model because existing Oxlint rules include scalar and multi-position options, not just one options object. For rules with exactly one object option, offer the ergonomic object form shown in the sample (`options: { ... }`) through a typed normalization layer. Define and test its unambiguous conversion to the native tuple. Do not accept arbitrary options on optionless rules.

Extend `defineRule` and the native-rule helper so each registered rule declares or derives:

- Stable ID and canonical description.
- Enforcement engine.
- Typed supported option tuple and runtime validator/schema.
- Default severity/options.
- Supported configuration scopes (project, file type, or both).

Prefer inferring custom-rule options from a typed schema/codec if feasible with existing dependencies. If a schema and TypeScript type must be maintained together, colocate them on the rule and test alignment. Audit all current native configurations; do not infer the allowed option type solely from literal default values.

Unknown IDs/options, malformed tuples, empty reasons, and unsupported scope overrides must fail configuration validation before linting. No silent filtering as in the current implementation.

### 5.3 Compiler and advisory rules need distinct treatment

- Existing compiler-backed rule IDs can be configured at project/default scope, not per file type: TypeScript flags govern compiler projects.
- Exclude compiler-only IDs from the file-type rule map at compile time and validate this at runtime.
- Initially support enabled/error or off for compiler requirements; do not pretend native `tsc` can make an individual compiler policy a warning.
- Advisory rules remain visible in effective policy but are explicitly labeled not mechanically enforced. Do not count them as successful machine checks.
- A project-wide compiler opt-out is an explicit architecture edit. File-specific needs require a separate TS project or a genuine compiler-supported exception, not fake per-file flag changes.

### 5.4 Public exports

Export `defineArchitecture`, `defineRule`, the inferred architecture/file-policy types, and useful rule option types. Return an immutable normalized architecture value, not an Oxlint-only config.

Remove the public `createConfig` export. Keep an internal `compileOxlintConfig` adapter. Preserve a generated plugin export only as an implementation/integration artifact; direct plugin use is not advertised as full architecture enforcement.

## 6. File inventory and TypeScript membership

### 6.1 Project root

Default root to the directory containing `architecture.config.ts`; an explicit CLI config path changes that root predictably. Do not derive it from arbitrary process working directories. All discovered managed files must be inside this root unless a future explicit multi-root feature is added.

Scan independently of `.gitignore`: ignored source must not become invisible. Fixed operational exclusions may cover Git metadata and dependency-install directories (`.git`, `node_modules`, pnpm's store). Document the exact list; do not implicitly ignore `dist`, build outputs, dotfiles, or examples.

Reject symlink escapes from the root, prevent traversal loops, and normalize identity without assuming a case-insensitive filesystem.

### 6.2 TypeScript resolution

Resolve configured tsconfigs, inheritance, `files`, `include`, `exclude`, and optionally followed project references with TypeScript-compatible semantics.

Distinguish:

- Root files selected by compiler configuration.
- Local source files pulled into the program by imports, even outside include patterns.
- External declaration/library files from dependencies.
- Local declaration files, which remain governed source unless explicitly part of generated output.

Govern local project sources, including import-reachable ones. Do not require classifying third-party declaration files. Discovered project source files outside all compiler projects must produce a membership error rather than silently escaping checking.

Resolve actual program semantics where necessary; reading `include` strings alone is insufficient. Deduplicate a physical file shared by several TS projects for file classification, while checking each project's compiler requirements and resolving its imports in each applicable project context.

### 6.3 Non-source files and narrow tooling allowances

Inventory every non-infrastructure file and account for it through:

- Governed source membership/classification.
- `files.otherFiles` permissions for assets, docs, manifests, and configuration.
- Reasoned generated-output exclusions.

Do not allow `otherFiles: ["**/*"]` to bypass source classification. Source extensions (`.ts`, `.tsx`, `.mts`, `.cts`, declaration variants, and JavaScript equivalents) cannot be broadly exempted as miscellaneous files. The architecture config and exact tooling config files may be explicitly permitted as tooling files outside the application TS projects; validate this exception narrowly and document that imported application source cannot use it to escape classification. During implementation, choose an explicit typed `toolingFiles` field if needed to make this distinction clearer than `otherFiles`; keep source bypass tests mandatory.

Recognize JS source even when the TS project has `allowJs: false`; it must be covered by an appropriate project or reported. Assets such as CSS/JSON/images can be allowed independently. More sophisticated asset-specific checks are out of scope.

Generated exclusions are explicit trust boundaries, not a general ignore mechanism. Report/reject imports from governed source into ignored generated executable source in v1 unless that code is instead configured as a governed project. No implicit exemption for imported generated code.

### 6.4 Classification

For each governed source file, evaluate every file type's positive patterns minus its explicit `exclude` patterns:

- Zero types: error identifying the uncovered path.
- One type: normalize effective policy.
- Multiple distinct types: error listing names and matching patterns.
- Multiple matching patterns within one type are not an ambiguity.

Validate configuration shape immediately. Detect overlaps against actual files on every run. Do not promise complete mathematical intersection testing for arbitrary globs. Optional obvious-overlap preflight can be added, but cannot replace inventory checks.

## 7. Naming enforcement

Refactor `file-naming` so new architecture policies validate all classified files regardless of suffix matches.

Required acceptance example:

- A TS project includes `src/**/*.ts`.
- One file type matches `src/**/*.ts`.
- `defaults.naming.case` is `pascal`.
- `src/abc.ts` is classified, then reported as invalid naming; it does not become unmatched or ignored.

Proposed policy fields: `case`, optional `prefix`, optional explicit suffix conventions, and optional exact framework filenames. Validate against a defined stem after removing recognized extensions (including `.d.ts`, `.d.mts`, and `.d.cts`). Do not silently strip arbitrary dotted filename components; suffix conventions such as `.test` must be explicit.

Retain needed existing filename capabilities through migration, but remove bypass behavior that would defeat a configured case policy. Naming exceptions only affect naming, never inventory, import rules, or other lint rules.

Avoid two conflicting configuration routes: expose `naming` as the architecture-facing convenience for the registered naming rule, and reject simultaneous direct `file-naming` settings at the same policy scope (or exclude that ID from that map's public type).

## 8. Import permissions and resolution

Implement a registered architecture/import rule with canonical options/description; compile file-type `imports` conveniences into this engine. Do not duplicate policy text in the config compiler.

Categories:

- `internal`: permitted target file-type keys. Self-import permission is explicit.
- `external`: exact package specifiers or explicitly globbed subpaths. Permitting `react` does not silently permit `react/**`.
- `builtins`: normalized Node built-ins, treating `node:fs` and `fs` consistently. Empty by default.
- `assets`: root-relative patterns for already-permitted non-source assets. This cannot authorize unclassified executable source.

Check runtime and type-only imports equally in v1. Handle import declarations, export-from/re-export declarations, literal dynamic imports, TypeScript import types/import-equals, and statically recognizable CommonJS imports. Reject unsupported nonliteral dynamic module loading by default with a specific diagnostic, rather than silently accepting it. Account for local shadowing of `require`.

Use resolved targets for internal classification; path aliases, `.js` specifiers resolving to `.ts`, and workspace-package names must not bypass restrictions. Resolve workspace-local packages as local governed code rather than automatically external dependencies. A forbidden internal module cannot be laundered through a re-exporting barrel: validate every managed module's edges.

Unresolved imports, source imports into non-governed code, incompatible per-project resolution outcomes, and root escapes must produce actionable errors. Distinguish missing dependency/types from an actual denied import.

Do not claim general runtime dependency discovery (eval, arbitrary loaders). Add explicit enforcement limits to the rule description.

Architecture import checks can use a resolved graph prepass and source-linked lint diagnostics. Select the execution bridge during the technical spike, ensuring supported line suppressions are honored consistently with Oxlint rather than inventing a competing comment grammar.

## 9. Compiler policy enforcement

Continue generating `tsconfig.base.json` from compiler-backed `defineRule` entries. Recommend extending it for editor consistency.

For every configured/referenced TS project:

1. Read effective compiler settings using TS semantics, including strict-family inheritance.
2. Compare enabled architecture requirements with effective settings.
3. Report conflicting/weakened settings with project path, rule ID, expected value, and actual value.
4. Type-check with the resolved project configuration after policy validation.

Do not silently force flags while allowing the editor to remain weaker. In particular, `strict: true` plus an explicit `strictNullChecks: false` must not be treated as satisfying a strict policy. Define checks for strict-family overrides and options such as `noCheck` that undermine the checker.

Do not require textual duplication of flags already supplied through `extends`. Module settings, JSX mode, target, library selection, path aliases, and framework settings remain project-owned unless a registered policy explicitly governs them.

Missing or invalid configured tsconfigs are errors, not skipped checks. Support references without dropping leaf projects or generating production artifacts unintentionally. Prototype safe no-emit/build-mode behavior with composite projects and avoid version-sensitive assumptions.

## 10. CLI and execution architecture

Target commands:

```text
architecture-check [--config path] [--fix] [project-dir]
architecture-check explain <file> [--config path]
```

Keep the existing package binary aliases pointing at the new required-config behavior.

Pipeline:

1. Locate/load `architecture.config.ts` and establish root.
2. Validate/normalize configuration (including runtime checking).
3. Resolve TS projects and compiler policies.
4. Inventory files and classify all local source.
5. If structural validation fails, stop before `--fix` changes source.
6. Build resolved import information.
7. Generate effective lint policies for exact classified file sets and run Oxlint/custom checks.
8. Run required TypeScript checks and aggregate results.

Never pass competing file-type overrides to Oxlint and rely on its override ordering. Classification happens first, then compile the single effective policy for each file/group. Do not let incidental nested Oxlint configs alter the contract.

Config loading executes trusted project code (the same trust as other build configuration), not a sandbox. Support ESM TypeScript configuration on the supported Node baseline with a documented loader strategy. Preserve relative path semantics; do not leave generated config artifacts in unmanaged project locations. Reuse installed capabilities where possible.

`--fix` only applies supported code fixes. Never rewrite architecture definitions, tsconfig, manifests, filenames, or folder structure automatically.

`explain` shows project membership, matching file type/pattern, naming policy, import allowlists, effective rules/options, origins/reasons, and enforcement limitations. Unclassified/ambiguous files should still produce an explanation of the failure.

Return nonzero for any architecture, configuration, lint-error, or compiler failure. Report spawn/load errors clearly. Maintain stable personal rule IDs in diagnostics.

## 11. Inline exceptions

Allow the existing Oxlint suppression syntax for line-addressable lint checks, with a nonempty explanatory reason as project policy. Verify the installed Oxlint version's supported comment syntax and unused-directive reporting before implementing reason checks.

Do not let inline comments suppress:

- Missing/invalid architecture configuration.
- Missing/unclassified/ambiguous file inventory.
- Compiler-project requirement conflicts.

Do not add an approval workflow. Suppressions remain the deliberate rare escape hatch discussed with the user. Explain whether a rule is suppressible and through which engine.

## 12. Implementation milestones

### Milestone A — feasibility spikes and compile-time API fixtures

- Verify TS 7 project/config/program/module-resolution APIs and referenced-project behavior with installed dependencies.
- Verify trusted TS config loading and Oxlint invocation, exact file selection, plugin options, suppression support, and nested-config isolation.
- Prototype literal file-type inference and ID-specific option tuples with positive and negative compile-only fixtures.
- Resolve the narrow tooling-file representation before finalizing the public config schema.
- Propose any missing dependency capabilities and wait for approval before installation. No dependency choice is implicit in this plan.

Deliverable: tested API signatures and engine adapters' technical contracts; no claims based on hypothetical TS APIs.

### Milestone B — typed rules and architecture normalization

- Extend `defineRule`/native helper with typed options, runtime schemas/validators, and scope metadata.
- Migrate all current registered rules without changing their intended defaults.
- Add `src/core/defineArchitecture.ts`, policy types, runtime validation, normalization, and provenance.
- Implement deterministic inheritance/replacement and strict errors for unknown configuration.

### Milestone C — project discovery, inventory, and classification

- Add TS project resolution and compiler-project graph representation.
- Implement root scanning, explicit auxiliary/generated accounting, symlink policy, membership checks, and exact-one classification.
- Make structural failures independent of lint-selected file lists.

### Milestone D — naming and import enforcement

- Adapt naming to classifier-selected files and explicit stem conventions.
- Add the resolved import permission engine and native/custom diagnostic bridge.
- Test aliases, workspace packages, barrels, built-ins, assets, dynamic imports, and suppressions.

### Milestone E — compiler validation and runner

- Validate effective TS options against registry requirements.
- Replace CLI fallback behavior with required architecture loading.
- Internally compile effective policies to Oxlint; integrate TypeScript checks and failure aggregation.
- Add `explain`, controlled `--fix`, and useful configuration error reporting.

### Milestone F — migration, examples, and release checks

- Replace README/API examples and CLI documentation; clearly document the breaking change.
- Provide copyable React SPA, Node CLI, and TS library architecture examples; Next.js can follow after server/client boundary requirements are designed.
- Give this repository its own explicit architecture config, including intentional permissions for examples, docs, tests, and committed generated outputs. Do not broadly exempt `src` or tests just to get a green check.
- Remove/replace `createConfig` implementation, old config tests, and bundled fallback config.
- Rebuild committed `dist` and `tsconfig.base.json`; verify package exports and a consuming-project smoke test.

## 13. Test and acceptance matrix

### Compile-time contract tests

- Valid file-type references inferred without manual generics.
- Misspelled internal target rejected, including within defaults.
- Unknown rule ID, invalid severity, wrong scalar/tuple/object options, unsupported option keys rejected.
- Optionless rules reject options; defaults do not over-narrow legal options to literal default values.
- Compiler rule overrides rejected at file-type scope.
- No unsafe catch-all overload allowing invalid configurations.

### Runtime validation and inheritance

- The same invalid inputs are rejected when supplied as JS/untyped values.
- Severity preserves options; explicit options replace; defaults imports inherit; explicit empty imports revoke inheritance.
- Invalid glob/config references and empty reasons fail clearly.
- No merge of policies from two matching file types.

### Inventory and naming

- `src/abc.ts` under a Pascal naming policy is an error, not a matcher miss.
- New unclassified TS source, `.js` under an `allowJs: false` project, and unknown root files fail.
- Explicit permitted assets/docs pass; broad asset permissions cannot hide source files.
- One source matching two types fails even if rule settings agree.
- Same-type overlapping patterns pass; per-type exclusions correctly handle colocated tests.
- Generated output, tooling config exceptions, hidden files, `.gitignore`, root escapes, and symlink cycles tested.
- Include/exclude inheritance, imported source outside includes, and reference-only root tsconfigs tested.

### Import graph

- All import categories denied when omitted; explicit permissions and inherited permissions behave exactly as documented.
- Internal aliases and workspace imports cannot masquerade as external packages.
- Re-exports, import types, literal dynamic imports, and CommonJS forms checked.
- Nonliteral module loading fails explicitly; unresolved imports are not silently allowed.
- External package subpaths, built-in aliases, permitted assets, and generated/tooling bypass attempts covered.

### Compiler policy

- Extending the generated base satisfies requirements without textual duplication.
- Weakened flags and strict-family subflags fail; meaningful strict opt-outs follow configured architecture scope.
- Missing project, malformed config, referenced-project violations, and conflicting shared-file project settings handled.
- Type checking does not accidentally emit application artifacts.

### End-to-end CLI

- Missing architecture definition errors; no bundled fallback.
- Config-root resolution is independent of invocation cwd.
- Structural failures stop fixes; naming violations cannot be skipped by file matching.
- Stable exit codes/diagnostics, native plugin loading, inline exception handling, and explain provenance.
- A temporary consuming project can import built `defineArchitecture` with inferred types and run the packaged CLI.
- Full existing rule regression suite still passes in a suitable Oxlint environment; environment failures documented separately.

## 14. Non-goals and follow-ups

Not part of this implementation:

- New mutation, purity, ownership, or effect-analysis rules.
- Dependency approval, package installation controls, config-edit approval, or CI protection machinery.
- Automatic project refactors, file moves, or invented domain boundaries.
- A required `defineDomainRouter` runtime API.
- General proof that arbitrary globs can never intersect.
- General runtime dependency discovery or proof of transitive function purity.
- A mandatory application folder layout.

Follow-ups enabled by this framework:

- Scope-aware mutation policies with documented ownership limitations.
- Pure-module effect restrictions.
- Feature/module boundaries orthogonal to file types (prevent cross-feature internal imports without inventing a new role for every feature).
- Server/client classifications and framework-specific presets/examples.
- Additional asset/generated-source integrations, incremental/watch performance, and richer graph diagnostics.

## 15. Completion criteria

A consumer can define its architecture once, receive compile-time help for rule options and file-type relationships, and run one command that fails on unauthorized files, ambiguous roles, invalid names, forbidden imports, weakened compiler requirements, and existing lint violations. All rule exceptions are explicit and scoped. Nothing silently falls back to a permissive profile, and no project-specific directory structure is assumed by the package.

## 16. Implementation status

Implemented the framework milestones in this repository:

- Added `defineArchitecture`, inferred file-type references, per-rule typed options, runtime schema validation, normalized policies, and provenance.
- Removed the public `createConfig` API and no-config CLI fallback.
- Added project-root inventory, TypeScript program/reference resolution, exact-one classification, naming validation, resolved import permissions, compiler policy checks, and reasoned line exceptions.
- Added required-config CLI execution, `explain`, structural validation before fixes, and whole-contract revalidation after fixes.
- Migrated the repository configuration and README; supplied React SPA, Node CLI, and TS library boilerplates; regenerated committed distribution artifacts.
- Mutation/ownership analysis remains intentionally deferred.

Concrete implementation decisions from the feasibility work:

- `toolingFiles` is a separate exact-path permission, not an `otherFiles` source-glob escape hatch.
- Managed symlinks are rejected rather than attempting to assign different policies to aliases of one physical file.
- TypeScript 7's installed API provides program membership, ASTs, symbol targets, and no-emit diagnostics. Its CLI `--showConfig` provides effective configuration/reference discovery. No legacy TypeScript 5/6 compiler API is assumed.
- Import constraints are checked in every configured project containing a file; no arbitrary first-project resolution is selected.
- Custom option contracts live alongside their rules; native option types and runtime schemas come from the pinned Oxlint package.
- Exact absolute selectors are used with a private child-directory Oxlint config. Native regression tests cover root/filename glob metacharacters; do not move that config to the project root without revisiting pinned Oxlint's matching semantics.
- ESLint was moved from existing devDependencies to dependencies, retaining its locked version, because public custom-rule declarations reference its types. No new dependency package/version was selected. Public declarations were checked in an isolated consumer using production dependencies.
- Source/application approval and package-management controls remain external to this implementation.

Validation at implementation handoff:

- Build and complete TypeScript checks (including negative API type fixtures): passed.
- Full test run: 117 passed, 288 failed at Oxlint RuleTester's `Array buffer allocation failed`, 1 opt-in native plugin test skipped.
- The focused architecture/configuration/project/CLI/compatibility tests passed, including real native Oxlint exact-selector checks that do not require the JS-plugin allocator.
- Packaged `explain` against this repository: passed; its inventory and compiler-policy checks report no structural issues.
- The full CLI's JS-plugin path also hits this VM's native allocator limitation. Full native rule/plugin validation is **not signed off**; rerun in a suitable environment, including `ARCHITECTURE_NATIVE_TESTS=1 pnpm test`, before release. No tests were silently rewritten to report those native failures as passes.
