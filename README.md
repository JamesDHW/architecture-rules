# architecture-rules

Write down how your TypeScript project is built (its layers, what each may depend on, where it starts, and its coding rules) in one `architecture.config.ts`, and have one command check every file against it, deterministically: structure, lint rules, compiler errors and dead code. The editor shows exactly the same findings.

Requires **Node.js 24+**.

## Philosophy

Most lint tools start from the file and work outwards. architecture-rules works
from the outside in, in the order you make decisions on a new project:

1. **Stack**: the language and runtime. Architecture rules assumes TS as the stack.
2. **Packages**: the third-party packages the project uses. `package.json` already lists them, so the configuration does not repeat that list.
3. **Layers**: the kinds of file the codebase contains and where they live. Every source file belongs to exactly one layer. A layer can be an **entry** (something outside the program loads it) or **development** only (it never ships).
4. **Dependencies**: what each layer may import: other layers (`internal`), and packages and Node built-ins (`external`). Anything not listed is denied.
5. **Rules**: per-file rules that narrow how code inside a layer may be written.

The per-file rules take their cue from Go: where TypeScript offers several ways to express the same logic, pick one and enforce it. No `else`, no `let`, no unnamed compound conditions, one way to branch over a union. Two files doing similar work should look alike, so a reader (human or agent) spends their attention on the business logic, not on the author's style.

`architecture-check` checks every decision automatically instead of leaving it to review. Each rule carries its own reasoning, so an agent that hits a violation learns why the rule exists, not just how to silence it. Exceptions are local and explicit, and each one needs a written reason.

Nothing is left over either: every file must be reachable from an entry, every export imported, every package used, and every line of the configuration itself (each dependency grant, each pattern, each allowance) must still be needed.

## Quick start

Install the package. It is not on npm yet; install it from Git and pin a commit or tag so checks are reproducible:

```sh
pnpm add -D github:JamesDHW/architecture-rules
```

Create **`architecture.config.ts`** at the project root. It reads in the same order (step 2 is your `package.json`):

```ts
import { defineArchitecture } from "architecture-rules";

export default defineArchitecture({
  // 1. Stack: the TypeScript projects that decide which files are checked.
  projects: { tsconfigs: ["tsconfig.json"] },

  // 3. Layers, each with 4. the dependencies it may have.
  layers: {
    app: {
      description: "Starts the program.",
      files: ["src/main.ts"],
      entry: { reason: "package.json's bin runs this file." },
      dependencies: { internal: ["domain", "adapter"] },
    },
    domain: {
      description: "Business decisions and models. No I/O.",
      files: ["src/domain/**/*.ts"],
      dependencies: { internal: ["domain"] },
    },
    adapter: {
      description: "Talks to external systems.",
      files: ["src/adapters/**/*.ts"],
      dependencies: { internal: ["domain"], external: ["zod", "node:fs/promises"] },
    },
    tests: {
      description: "One test file per subject.",
      files: ["tests/**/*.test.ts"],
      entry: { reason: "The test runner loads every test file." },
      development: true,
      dependencies: { internal: ["domain", "adapter"], external: ["vitest"] },
    },
  },

  // 5. Rules: every rule applies everywhere; change one only with a reason.
  naming: { case: "camelCase" },
  rules: {
    "max-file-lines": ["error", { max: 300 }],
  },
});
```

Extend the compiler preset in **`tsconfig.json`**, so your editor reports the same compiler errors as the checker:

```json
{
  "extends": "architecture-rules/tsconfig",
  "compilerOptions": { "target": "ES2022", "module": "NodeNext", "noEmit": true },
  "include": ["src"]
}
```

Then look at the architecture and check it:

```sh
pnpm exec architecture-check describe   # what the architecture is, in under a second
pnpm exec architecture-check            # check every file against it
```

Starting points for other project shapes are in `examples/` (a React SPA, a Node CLI and a TypeScript library). They are visible templates, not hidden presets: copy one and adapt it.

## For agents

Add something like this to your `AGENTS.md` or `CLAUDE.md`:

```md
Before changing code, run `pnpm exec architecture-check describe` to see the layers, what each may import, and which layers may use each package. After changing code, run `pnpm exec architecture-check` and fix every finding. Do not edit architecture.config.ts or add exceptions without asking.
```

`describe` reads only the configuration, so it is fast. `explain <file>` shows the full effective policy for one file, including every rule setting and its origin.

After the findings, the checker prints a **How to fix** section: for each rule that fired, the rule's own "write this instead" line and the path to its page in `docs/rules/`. The guidance comes from the rule definition, not from whoever reads the output.

## Rule documentation

[`docs/rules/`](docs/rules/README.md) has one generated page per rule, built from the rule's `defineRule(...)` definition and its test cases:

- `description`: what the rule asks for, with good and bad lines.
- `instead`: one line saying what to write instead. The checker prints it next to findings.
- `suppressWhen`: when a reasoned exception is acceptable, with a ready-made exception comment.
- `evasions`: workarounds that satisfy the rule's wording but miss its point. Each names the rule that reports it, or says that review has to catch it. Tests check both claims.
- Examples: the `valid` and `invalid` cases from `src/rules/cases/*.cases.ts`, the same cases the rule tests run.

Do not edit `docs/rules/` by hand; `pnpm run build` rewrites it.

## Configuration

### 1. Stack: `projects`

```ts
projects: { tsconfigs: ["tsconfig.json"], references: "follow" }
```

The stack is always TypeScript, so the only stack setting is which projects to read.

TypeScript owns what is checked:

- The configuration's directory is the root, whatever the working directory.
- The listed TypeScript programs decide membership through `files`, `include`, `exclude`, `extends`, `allowJs`, imports and references. The repository is never rescanned with another glob engine, and `.gitignore` does not matter.
- `exclude` limits discovery, not imports: an excluded file imported by included source is still part of the program and is checked.
- Files outside the programs (docs, assets, lockfiles, other configuration) are ignored. There are no allowlists for them.
- Referenced projects are followed. With `references: "explicit"`, only the listed tsconfigs are checked, so list every leaf project yourself.
- Symlinked source and files outside the root are rejected.

`architecture.config.ts` is tooling, not application code: exclude it in your tsconfig if an `include` such as `**/*.ts` would select it. It is always loaded as ESM. The CLI finds `architecture.config.ts`, then `.mts`, or takes `--config`.

The compiler preset (`architecture-rules/tsconfig`, or `architecture-rules/presets/tsconfig.json` if your TypeScript version ignores package exports in `extends`) only sets the options the rules require, such as `strict`, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Module, target, JSX and paths stay yours. The checker verifies the effective settings of every project, including strict-family flags switched off one by one, so extending the preset is recommended but not required. `noCheck: true` is an error.

### 2. Packages

`package.json` is the list of packages the project uses; the configuration does not repeat it. Which layers may import each package is decided in step 4, and `architecture-check describe` prints the inverse view: every package and built-in, with the layers that may import it.

### 3. Layers

```ts
layers: {
  component: {
    description: "Pure rendering from props.",
    files: ["src/features/*/ui/**/*.tsx"],
    exclude: ["**/*.stories.tsx"],
    naming: { case: "PascalCase" },
    dependencies: { internal: ["component", "domain"], external: ["react", "react/jsx-runtime"] },
  },
}
```

- `files` and `exclude` are root-relative globs. Every source file in the programs must match exactly one layer; matching none or two is an error, even when both layers have identical settings.
- Layer names are yours. Naming a layer `adapter` grants nothing by itself.
- A layer's `naming` and `rules` override the project-wide ones.

**Naming** checks files after they are selected, so a badly named file fails rather than slipping out of its layer. A filename reads `<stem><suffixes>.<extension>`:

```ts
naming: {
  case: "camelCase",             // or "PascalCase", "kebab-case", "snake_case", or a list of them
  prefix: "use",                 // optional; the stem must start with one of them
  suffixes: [".rule", ".test"],  // optional; any of them may stack: noLet.rule.test.ts
  requiredSuffix: ".test",       // optional; every file must carry one of them
  allowedNames: ["page.tsx"],    // exact framework filenames, exempt from naming only
}
```

Without a naming policy, no convention is assumed.

**Generated files** get a layer of their own, marked `generated`:

```ts
routeTree: {
  description: "TanStack Router route tree.",
  files: ["src/routeTree.gen.ts"],
  generated: { reason: "Written by the TanStack Router plugin on every build." },
  dependencies: { internal: ["route"], external: ["@tanstack/react-router"] },
},
```

A generated layer is still classified, named, import-checked and type-checked. It is never linted, its exception comments are not checked, and it takes no `rules`. Its unused exports are not reported (generators emit exports nobody calls), but a generated file that nothing imports is.

**Entries** are where the program is entered from outside: a bundler, a router, a test runner, a package consumer. Everything else is used only if something imports it, so an entry is where dead code can hide, and it needs a reason:

```ts
route: {
  description: "One file per URL.",
  files: ["src/routes/**/*.tsx"],
  entry: { reason: "The router loads every route file.", exports: ["Route"] },
  dependencies: { internal: ["component", "domain"], external: ["@tanstack/react-router"] },
},
```

- `files` (optional): only these files of the layer are entries; every file of the layer by default.
- `exports` (optional): the exports something outside the program uses, by name, or `"all"` for a public API such as a library's index. By default none: being loaded is not being imported, so any export of an entry file is reported as unused.
- `package.json`'s `main`, `exports` and `bin` are not entries by themselves; mark the layer that holds them.

**Development layers** (`development: true`) hold code that never ships: tests, stories, scripts, tool configuration. They may use devDependencies, and they keep no production code alive: a file or export only a development layer uses is reported by `production-reachability`. Tool configuration such as `vite.config.ts` must be in a tsconfig and a layer, like any other source; otherwise the packages it imports look unused.

### 4. Dependencies

Each layer lists what it may import:

```ts
dependencies: {
  internal: ["domain", "contracts"],
  external: ["zod", "@example/client", "@example/client/**", "node:fs/promises"],
  assets: ["public/**/*.svg"],
}
```

Anything not listed is denied. There is no project-wide default: every layer states its own dependencies, so reading one layer tells you everything it may import. Imports within a layer must be listed too (`internal: ["domain"]` on the domain layer).

- `internal` names layers. Imports are resolved with the TypeScript project, including path aliases and `.js` specifiers that resolve to `.ts`.
- `external` names package specifiers. A package does not permit its subpaths implicitly; list them or use `/**`.
- Node built-ins are external too, written one way: with the `node:` prefix. `"node:fs/promises"` permits both `node:fs/promises` and `fs/promises` imports; a bare `"fs"` in the list is an error, so a built-in can never be mistaken for an npm package of the same name.
- `assets` are root-relative patterns for non-source imports such as stylesheets and images. Asset imports must exist inside the root.
- Re-exports, type-only imports, literal dynamic imports, `import x = require()` and recognizable CommonJS `require` calls all count. Loading a module by a computed name needs a reasoned line exception.
- Importing source that belongs to no layer is an error.

### 5. Rules

The package ships about a hundred rules. They are on everywhere by default:

- **Branching**: no `else`, braces except for one-line terminal guards, named compound conditions, `switch` for repeated comparisons, exhaustive switches.
- **Immutability**: no `let`, no in-place array mutation, long-lived state only in `*.state.ts` modules, readonly types.
- **Type safety**: no `any`, no type assertions, no non-null `!`, strict boolean conditions.
- **Errors**: return errors as values; raw `throw`/`catch` belongs in one error adapter layer.
- **Structure**: one concept per file, named exports, file length limits, no import cycles, React hook and key rules.

Each rule's description, with good and bad examples, is in its definition under `src/rules/`. Adjust a rule project-wide or for one layer:

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

Settings apply in this order: the rule's default, then the project-wide `rules`, then the layer's `rules`, then a reasoned line exception. Rule IDs and options are type-checked, and validated again at runtime; an invalid setting is an error, never ignored. A severity-only change keeps inherited options; explicit options replace them. Compiler rules can only be set project-wide, to `"error"` or `"off"`. The structural checks (inventory, classification, project membership, compiler checking) cannot be turned off.

**Line exceptions** name architecture rule ids and give a reason, on the line above or at the end of the line:

```ts
// architecture-disable-next-line allowed-imports -- The framework loads a configured module name.
const plugin = await import(moduleName);
const data = response.data; // architecture-disable-line generic-name-denylist -- The API names this field data.
```

File-wide exceptions, exceptions without a reason, unknown rule ids and other tools' disable or configuration comments are rejected before anything is linted. An exception that covers no finding is an error. Structural, configuration and compiler checks cannot be excepted. `--fix` never rewrites a line an exception covers, and converts reasoned disable comments from earlier versions (`// oxlint-disable-next-line architecture/no-let -- …`) into exceptions.

### Dead code and dead configuration

These rules are on by default, all at `error`, so nothing unused survives. They run over the whole program after the lint and compiler stages:

| Rule | Fails when |
| --- | --- |
| `unused-files` | A file in the TypeScript programs is not reachable by imports from any entry. |
| `unused-exports`, `unused-types` | An export nothing imports, including one used only inside its own file, and entry exports their layer does not name. |
| `duplicate-exports` | The same value is exported under two names. |
| `production-reachability` | A file or export of a production layer is used only by development code: development layers, and the tests, `package.json` scripts and tool configuration the analysis recognises. A script that runs in production is an entry: mark its layer. |
| `unused-dependencies` | A package in `package.json` that no file imports, no script runs and no tool configuration uses. |
| `unlisted-dependencies` | A package that is imported but not declared, or a devDependency that a production layer imports. |
| `unlisted-binaries` | A script runs a command no declared package provides. |
| `unresolved-imports` | The dead-code analysis cannot resolve an import TypeScript resolves, so its view of what is used is incomplete. |
| `unused-permissions` | A layer grants an internal layer, external specifier or asset that none of its imports use. |
| `unmatched-patterns` | A layer's `files` or `entry.files` pattern matches no source file. Exclude patterns guard against future files and are not checked, nor are a generated layer's files, which may not exist before a build. |
| `competing-configuration` | Another linter's or dead-code tool's configuration is in the root (see below). |
| `typescript-version` | The project's own TypeScript is not the checker's version, so editors would report different compiler errors. |

File-level dead-code rules can be set per layer; dependency and configuration rules only project-wide. There are no ignore globs. An unused export that something outside the program really reads takes a line exception; a package used without being imported is allowed by name, with a reason, and an allowance nothing needs is itself reported:

```ts
rules: {
  "unused-dependencies": { options: { allow: ["sharp"] }, reason: "The image service loads sharp at runtime." },
}
```

In a workspace monorepo (`pnpm-workspace.yaml` or `package.json` `workspaces`), each file is analysed in its own package, and an import of another package counts like any other import. A package's `package.json` `exports` make its files reachable, but their exports still count as used only when something imports them, unless a layer's `entry.exports` makes them public. `architecture.config.ts` is always an entry. The JSX runtime that JSX compiles to counts as a use of a layer's `react/jsx-runtime` grant.

Dead-code findings are never fixed automatically: deleting code is a decision. The dead-code stage reads `package.json` in the architecture root; without one it warns and skips.

## CLI

```sh
architecture-check                                # check the project
architecture-check --fix                          # apply the lint fixes that are safe, then check again
architecture-check explain src/domain/Project.ts  # the effective policy for one file, as JSON
architecture-check describe                       # a plain-text summary of the architecture
architecture-check describe --json                # the same, as JSON
architecture-check describe --mermaid             # the layer import graph as a Mermaid flowchart
architecture-check --file src/domain/Project.ts    # lint and report only this file (repeatable); the project is still analyzed
architecture-check --json                         # every finding, and what to write instead, as one JSON document
architecture-check report > architecture-report.md  # Markdown: findings by rule, exceptions, overrides and layers
architecture-check --config ./architecture.config.ts
architecture-check lsp                            # the language server editors start
```

A check runs in four stages: structure (inventory, classification, compiler settings, exceptions, configuration), then lint with each file's policy, then TypeScript's diagnostics, then dead code. Structural failures stop the run before any fix is applied. `--fix` never changes the configuration, tsconfigs, filenames or `package.json`, and never deletes code. `describe` reports import cycles between layers and lists layers so each comes after the layers it imports.

The output groups findings by file and ends with a summary:

```text
architecture-check · 2 projects · 412 files · 9 layers

src/domain/order.ts
  12:5  error    no-let          Declare this with const and compute a new value instead of reassigning. See rule no-let.
  40:14 error    unused-exports  `formatOrder` is exported, but nothing imports it.

✗ 2 errors in 1 file
  by rule:   no-let 1 · unused-exports 1
  by layer:  domain 2
  stages:    structure ✓ · lint ✗ · types ✓ · dead code ✗ · 2.4s

How to fix:
  …
```

`--json` prints the same findings, the guidance and the summary as one document.

## In the editor

`architecture-check lsp` is a language server: on every save, and when files change on disk, it runs exactly the check the command runs and publishes its findings, with the same rule ids, messages, severities and positions, each linked to its rule's page. A configuration that does not load is shown on `architecture.config.ts`.

For VS Code, `editors/vscode` is an extension that starts the workspace's own `architecture-check lsp`; see its README to install it. Other editors can start the server the same way.

Findings reflect saved files, which is what makes them match the command. Compiler errors also come from the editor's own TypeScript, which matches as long as the editor uses the project's TypeScript (see `typescript-version`).

### If the project already has a linter or a dead-code tool

The check never reads another tool's configuration: it runs its own pinned engines with configuration compiled from `architecture.config.ts`, so an existing setup cannot change its result. But two sources of truth disagree, and editors show the other tool's warnings, so `competing-configuration` reports another linter's or dead-code tool's configuration in the root (ESLint, Biome's linter, `.oxlintrc.json`, `knip.json` and similar, or their `package.json` keys). Move the settings you still need into `architecture.config.ts` and delete the file, and turn the other tool's editor extension off for the workspace. During a migration, turn the rule off with a reason. Formatters are not affected.

## What it does not check

- **Feature boundaries.** Layers are horizontal; nothing yet stops one feature from importing another feature's internals within the same layer.
- **Purity and effects.** Calls are presumed pure; the rules check syntax, not what a function does at runtime.
- **Framework-loaded code beyond entries.** The dead-code analysis knows how common tools load their configuration, and may treat files such a tool loads as used even when no layer marks them as entries. JSDoc `@public`, `@beta` and `@alias` tags also keep an export from being reported.
- **Runtime loading.** `eval`, computed module names and other runtime loaders are not followed.

## Upgrading from earlier versions

- `fileTypes` is now `layers`, and a layer's `imports` is now `dependencies`.
- `builtins` moved into `external` with the `node:` prefix: `builtins: ["path"]` becomes `external: ["node:path"]`.
- `defaults.naming` and `defaults.rules` moved to the top level. `defaults.imports` is gone: every layer declares its own dependencies.
- Naming cases are spelled out (`"camelCase"`, `"PascalCase"`); `"pascalOrCamel"` becomes `["PascalCase", "camelCase"]`. Suffixes now stack.
- Extend `architecture-rules/tsconfig` instead of `architecture-rules/tsconfig.base.json`.
- Exception comments are now `// architecture-disable-next-line <rule-id> -- <reason>`. Run `architecture-check --fix` once to convert reasoned `oxlint-disable`/`eslint-disable` comments.
- Mark entry layers (`entry`) and development layers (`development: true`); until you do, the dead-code rules report every file nothing reaches.
- Expect findings for grants, patterns and packages that are no longer used; remove them.
- `--format json` is now `--json`, and the text output is grouped by file with a summary.

## Development

```sh
pnpm run build             # compile src/ to dist/
pnpm run typecheck
pnpm test                  # ARCHITECTURE_NATIVE_TESTS=1 adds the end-to-end tests that run the native engines
pnpm run test:architecture
pnpm check                 # build, typecheck and test
pnpm run architecture      # build, then check this repository against its own architecture
pnpm run describe          # build, then describe this repository's architecture
```

pnpm links a package's commands only into projects that depend on it, so this repository lists itself as a dev dependency (`"architecture-rules": "link:."`). After `pnpm install`, `pnpm exec architecture-check` works here as it does in any project, running the committed `dist/`. The two scripts above rebuild first; arguments pass through (`pnpm run describe --mermaid`).

This repository follows its own rules; `architecture.config.ts` at the root is both its configuration and a worked example. TypeScript's pinned 7.x API is used behind the analysis layer, so upgrading TypeScript needs the project-resolution tests to pass. TypeScript, the lint engines and the dead-code engine are pinned to exact versions and move together. The native tests need enough virtual address space for the lint engine's buffers; an allocation failure there is an environment problem, not a pass. `dist/` is committed so Git installs work without a build step; rebuild it with your changes.

### Generated files and the pre-commit hook

`dist/` and `docs/rules/` are committed, because Git installations do not run a build. `pnpm run build` deletes `dist/`, compiles, and regenerates `docs/rules/`. Enable the pre-commit hook once per clone:

```sh
git config core.hooksPath .githooks
```

The hook runs the build and stops the commit if any generated file differs from what is staged. Stage the rebuilt files and commit again.
