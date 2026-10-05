# architecture-rules

An executable, project-owned TypeScript/React architecture contract, enforced by
TypeScript program analysis and Oxlint. Requires **Node.js 24+** and pnpm.

`defineRule(...)` is the canonical source of each rule's explanation, defaults,
and enforcement. `defineArchitecture(...)` selects files and specializes those
rules. It does not invent a project layout or silently relax policies.

## Install and configure

This private package is installed from Git or a local path. `dist/` is committed
so Git installations do not need to run a build lifecycle script.

```sh
pnpm add -D github:JamesDHW/architecture-rules
```

Pin a commit or tag for reproducible architecture checks.

Create **`architecture.config.ts`** (or **`architecture.config.mts`**) at the project root:

```ts
import { defineArchitecture } from "architecture-rules";

export default defineArchitecture({
  projects: {
    tsconfigs: ["tsconfig.json"],
    references: "follow",
  },
  defaults: {
    naming: { case: "pascal" },
  },
  fileTypes: {
    domain: {
      description: "Business decisions and models.",
      files: ["src/domain/**/*.ts"],
      imports: { internal: ["domain"] },
    },
    adapter: {
      description: "External-system integration.",
      files: ["src/adapters/**/*.ts"],
      imports: {
        internal: ["domain", "adapter"],
        builtins: ["fs/promises", "path"],
      },
      rules: {
        "max-file-lines": {
          severity: "warn",
          reason: "Temporary migration allowance for integration modules.",
        },
      },
    },
  },
});
```

Extend the generated base in **`tsconfig.json`** for editor consistency:

```json
{
  "extends": "architecture-rules/tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "noEmit": true
  },
  "include": ["src"]
}
```

Module/JSX/path/runtime settings remain yours. Effective compiler requirements
are checked, including explicit strict-family weakening. Extending the base
is recommended, not textually required. Missing projects and `noCheck: true`
are errors; the checker never silently skips TypeScript.

```sh
pnpm exec architecture-check
pnpm exec architecture-check --fix
pnpm exec architecture-check --config ./architecture.config.ts
pnpm exec architecture-check explain src/domain/Project.ts
```

Both package binary aliases (`architecture-check` and `architecture-rules`)
run the same required-config checker. `--fix` only applies supported lint fixes;
it never changes architecture definitions, compiler configs, filenames, or
manifests. Structural failures stop the run before fixes.

## TypeScript owns the checking scope

- The configuration's directory is the root, independent of the working directory.
- The configured TypeScript programs determine membership using `files`, `include`,
  `exclude`, `extends`, `allowJs`, imports and references. Architecture-rules does
  **not** rescan the repository or reinterpret these options with another glob engine.
- TypeScript's `exclude` limits initial discovery, not imports: an excluded file
  imported by included source still belongs to the program and is checked.
- Every local TS/JS source or declaration in those programs must match **exactly
  one** file type. Files outside the programs are ignored, including other source,
  docs, assets, lockfiles and configuration. There are no auxiliary-file allowlists.
- JavaScript is governed when TypeScript includes it via `allowJs`; JSON/assets
  are not syntax-linted. Import permissions still apply to dependencies of selected code.
- Followed project references are checked too. `references: "explicit"` checks
  only the listed configurations; list every required leaf project yourself.
- Unselected generated output needs no architecture exclusion. Selected generated
  output needs a role marked `generated: { reason }` (see below).
- `.gitignore` does not determine scope. Selected managed symlinks and root escapes
  are rejected. Dependency-install libraries and standard libs are not application code.

Configuration files are not magically exempt: if your tsconfig selects one, give
it a role or adjust the tsconfig. `architecture.config.ts` is tooling, not
application code, so add it to the tsconfig's `exclude` when an `include` such as
`**/*.ts` would select it. It is always loaded as ESM, even in a package without
`"type": "module"`. The CLI discovers `.ts` first, then `.mts`, or accepts `--config`.

### Generated files

Give regenerated output its own file type and mark it `generated`:

```ts
routeTree: {
  description: "TanStack Router route tree.",
  files: ["src/routeTree.gen.ts"],
  generated: { reason: "Written by the TanStack Router plugin on every build." },
  imports: { internal: ["route"], external: ["@tanstack/react-router"] },
},
```

A generated file type is still classified, named and import-checked, and its
type errors are still reported. It is never linted, and its suppression comments
(generators often write a file-wide disable) are not checked. It takes no `rules`.

File types have consumer-defined names. `files` and optional `exclude` patterns
are root-relative positive globs. A file matching two types fails, even when
both types have identical rules. Multiple matching patterns in the same type
are fine. This checks actual files on every run, not hypothetical intersections
of all possible glob strings.

### Naming is enforcement, not selection

With a type matching `src/**/*.ts` and Pascal naming, `src/abc.ts` matches the
type and **fails naming**. There is no fallback or filename-based scope escape.

```ts
naming: {
  case: "camel",              // camel | pascal | pascalOrCamel
  prefix: "use",              // optional
  suffixes: [".test"],         // explicit stem suffixes, longest first
  allowedNames: ["page.tsx"],  // exact framework filenames; naming exception only
}
```

Recognized source/declaration extensions are removed before checking the stem.
Other dotted suffixes are not silently stripped. Without a naming policy, no
casing convention is assumed.

## Rule overrides

Existing rule defaults apply everywhere. Precedence is:

```text
registered defaults → defaults policy → one file type → supported line exception
```

```ts
rules: {
  "explicit-conditions": "warn",
  "max-file-lines": ["error", { max: 300 }],
  "named-predicates": {
    options: { nullishGuards: ["isNullish"], presenceGuards: ["isPresent"] },
    reason: "Approved project guard vocabulary.",
  },
}
```

Rule IDs and option tuples are type-safe. Single-object options can use the
object shorthand; positional options use the tuple form. Runtime validation
also protects JavaScript/dynamic callers. Invalid IDs/options/scopes are errors,
not ignored settings.

Severity-only changes preserve inherited options. Explicit options replace the
whole options tuple; omitted fields use the rule's own defaults, not inherited
fields. Rule maps combine by ID. An explicit `naming` or `imports` object replaces
its inherited object. Reasons and origin information appear in `explain`.

Compiler-backed IDs can be configured only under `defaults.rules`, with
`"error"` or `"off"`. They cannot vary by source-file type. Advisory rules are
shown as review obligations, not counted as machine-proven properties.

Mandatory inventory/classification/compiler-integrity checks cannot be disabled
through rule settings. Use `naming` and `imports`, not direct overrides of the
corresponding runner-controlled lint rules.

## Import permissions

```ts
imports: {
  internal: ["domain", "contracts"],
  external: ["zod", "@example/client", "@example/client/**"],
  builtins: ["fs/promises"],
  assets: ["public/**/*.svg"],
}
```

Omission denies all imports unless a defaults policy is inherited. An explicit
empty object revokes inherited permissions. Missing lists mean empty lists.
Self-type imports must also be permitted explicitly.

- Internal targets are resolved with the configured TypeScript project, including
  aliases and `.js` specifiers resolving to `.ts`.
- External permissions match source specifiers: a package does not implicitly
  permit all its subpaths. Installation approval remains outside this framework.
- Built-ins normalize `node:` aliases.
- Asset imports must exist inside the root and match the importer's asset policy;
  assets do not need a separate repository-file allowlist.
- Re-exports and type-only imports are dependencies too.
- Literal dynamic imports and recognizable CommonJS imports are checked.
  Nonliteral loading requires a narrow exception. Arbitrary runtime loaders,
  `eval`, and transitive function effects are not proved by this checker.
- Imports to unclassified executable source are rejected. An `exclude` entry in
  tsconfig does not grant an import-policy exemption.

File types are not feature boundaries. A later module-boundary layer can restrict
one domain feature from importing another feature's internals. V1 does not claim
that additional restriction, mutation ownership analysis, or functional purity.

## Narrow exceptions

Use Oxlint's supported line suppression syntax with named rules and a reason:

```ts
// oxlint-disable-next-line architecture/allowed-imports -- Framework loads a configured module name.
const plugin = await import(moduleName);
```

The checker rejects file-wide disables, inline rule reconfiguration, and missing
reasons. Unused directives are errors. Structural checks and compiler requirements
cannot be suppressed by lint comments. Approval of config edits remains the
responsibility of the user/agent harness, not this package.

## Boilerplate and migration

Copy and adapt:

- `examples/react-spa/architecture.config.ts`
- `examples/node-cli/architecture.config.ts`
- `examples/typescript-library/architecture.config.ts`

They are visible starting points, not automatic dependency choices or hidden
presets. Configure tests, styles, framework files, and any extra TS projects for
your actual application. Naming a type `adapter` grants no implicit permission.

**Scope migration:** remove the top-level `files` object (`otherFiles`,
`toolingFiles`, `generated`). These options are now rejected rather than silently
ignored; mark a generated file type with `generated: { reason }` instead. Point `projects.tsconfigs` at your real project configs; only source
selected by TypeScript needs a role. This replaces the old whole-root inventory
contract, including its requirement to classify source outside compiler projects.

**Breaking change:** `createConfig` and the no-config CLI mode have been removed.
Move global settings to `defaults.rules`; replace overlapping glob overrides
with disjoint file types. A direct Oxlint plugin invocation alone does not check
filesystem inventory, compiler settings, or resolved architecture imports.

## Development

```sh
pnpm run build
pnpm run typecheck
pnpm test
pnpm run test:architecture
pnpm check
```

TypeScript's pinned 7.x API is used behind an adapter; upgrades require project
resolution regression tests. Native Oxlint tests need enough virtual address
space for its raw-transfer buffers. A buffer-allocation failure is an environment
failure, not a passing test; ESLint compatibility tests do not replace native
integration validation. Set `ARCHITECTURE_NATIVE_TESTS=1` when running tests to
include the end-to-end native JS-plugin smoke test. ESLint is shipped for the
public rule declaration types; Oxlint remains the lint engine. Build artifacts
are committed and must be regenerated.
