# architecture-rules

Write down how your TypeScript project is built (its layers, what each may depend on, and its coding rules) in one `architecture.config.ts`, and have TypeScript and Oxlint check every file against it, deterministically.

Requires **Node.js 24+**.

## Philosophy

Most lint tools start from the file and work outwards. architecture-rules works
from the outside in, in the order you make decisions on a new project:

1. **Stack**: the language and runtime. Architecture rules assumes TS as the stack.
2. **Packages**: the third-party packages the project uses. `package.json` already lists them, so the configuration does not repeat that list.
3. **Layers**: the kinds of file the codebase contains and where they live. Every source file belongs to exactly one layer.
4. **Dependencies**: what each layer may import: other layers (`internal`), and packages and Node built-ins (`external`). Anything not listed is denied.
5. **Rules**: per-file rules that narrow how code inside a layer may be written.

The per-file rules take their cue from Go: where TypeScript offers several ways to express the same logic, pick one and enforce it. No `else`, no `let`, no unnamed compound conditions, one way to branch over a union. Two files doing similar work should look alike, so a reader (human or agent) spends their attention on the business logic, not on the author's style.

TypeScript and Oxlint check every decision automatically instead of leaving it to review. Each rule carries its own reasoning, so an agent that hits a violation learns why the rule exists, not just how to silence it. Exceptions are local and explicit, and each one needs a written reason.

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
    domain: {
      description: "Business decisions and models. No I/O.",
      files: ["src/domain/**/*.ts"],
      dependencies: { internal: ["domain"] },
    },
    adapter: {
      description: "Talks to external systems.",
      files: ["src/adapters/**/*.ts"],
      dependencies: { internal: ["domain", "adapter"], external: ["zod", "node:fs/promises"] },
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
Before changing code, run `pnpm exec architecture-check describe` to see the layers, what each may import, and which layers may use each package. After changing code, run `pnpm exec architecture-check` and fix every finding. Do not edit architecture.config.ts or add suppressions without asking.
```

`describe` reads only the configuration, so it is fast. `explain <file>` shows the full effective policy for one file, including every rule setting and its origin.

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

A generated layer is still classified, named, import-checked and type-checked. It is never linted, its suppression comments are not checked, and it takes no `rules`.

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

**Line exceptions** use Oxlint's syntax, with named rules and a reason:

```ts
// oxlint-disable-next-line architecture/allowed-imports -- The framework loads a configured module name.
const plugin = await import(moduleName);
```

File-wide disables, inline rule configuration and exceptions without a reason are rejected, and unused exceptions are errors.

## CLI

```sh
architecture-check                                # check the project
architecture-check --fix                          # apply the lint fixes Oxlint supports, then check again
architecture-check explain src/domain/Project.ts  # the effective policy for one file, as JSON
architecture-check describe                       # a plain-text summary of the architecture
architecture-check describe --json                # the same, as JSON
architecture-check describe --mermaid             # the layer import graph as a Mermaid flowchart
architecture-check --config ./architecture.config.ts
```

A check runs in three stages: structure (inventory, classification, compiler settings, suppressions), then Oxlint with each file's policy, then TypeScript's diagnostics. Structural failures stop the run before any fix is applied. `--fix` never changes the configuration, tsconfigs, filenames or `package.json`. `describe` reports import cycles between layers and lists layers so each comes after the layers it imports.

## What it does not check

- **Feature boundaries.** Layers are horizontal; nothing yet stops one feature from importing another feature's internals within the same layer.
- **Purity and effects.** Calls are presumed pure; the rules check syntax, not what a function does at runtime.
- **Installed packages.** `external` governs what may be imported, not what is in `package.json`. An import TypeScript cannot resolve is still an error.
- **Runtime loading.** `eval`, computed module names and other runtime loaders are not followed.

## Upgrading from earlier versions

- `fileTypes` is now `layers`, and a layer's `imports` is now `dependencies`.
- `builtins` moved into `external` with the `node:` prefix: `builtins: ["path"]` becomes `external: ["node:path"]`.
- `defaults.naming` and `defaults.rules` moved to the top level. `defaults.imports` is gone: every layer declares its own dependencies.
- Naming cases are spelled out (`"camelCase"`, `"PascalCase"`); `"pascalOrCamel"` becomes `["PascalCase", "camelCase"]`. Suffixes now stack.
- Extend `architecture-rules/tsconfig` instead of `architecture-rules/tsconfig.base.json`.

## Development

```sh
pnpm run build             # compile src/ to dist/
pnpm run typecheck
pnpm test                  # ARCHITECTURE_NATIVE_TESTS=1 adds the end-to-end Oxlint smoke test
pnpm run test:architecture
pnpm check                 # build, typecheck and test
pnpm run architecture      # build, then check this repository against its own architecture
pnpm run describe          # build, then describe this repository's architecture
```

pnpm links a package's commands only into projects that depend on it, so this repository lists itself as a dev dependency (`"architecture-rules": "link:."`). After `pnpm install`, `pnpm exec architecture-check` works here as it does in any project, running the committed `dist/`. The two scripts above rebuild first; arguments pass through (`pnpm run describe --mermaid`).

This repository follows its own rules; `architecture.config.ts` at the root is both its configuration and a worked example. TypeScript's pinned 7.x API is used behind the analysis layer, so upgrading TypeScript needs the project-resolution tests to pass. Native Oxlint tests need enough virtual address space for Oxlint's buffers; an allocation failure there is an environment problem, not a pass. `dist/` is committed so Git installs work without a build step; rebuild it with your changes.
