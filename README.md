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

For an existing codebase, read [Adopting on an existing codebase](#adopting-on-an-existing-codebase) first: the rules go on in one step, and the code follows file by file.

## For agents

Add something like this to your `AGENTS.md` or `CLAUDE.md`:

```md
Before changing code, run `pnpm exec architecture-check describe` to see the layers, what each may import, and which layers may use each package. After changing code, run `pnpm exec architecture-check` and fix every finding. Do not edit architecture.config.ts or add exceptions without asking.
```

In a codebase with a baseline, `architecture-check adopt --agent-snippet` prints the version that also covers recorded debt: every file an agent changes must be left compliant.

`--format agent` is for agent hooks: only what must change, one line per finding plus one line per rule on what to write instead, written to stderr, with exit code 2 on failure (most hook systems show such output to the agent). It prints nothing when the files are clean. Run it with `--file <edited file>` after each edit and with `--worktree` before the agent finishes; without a change flag it judges the working tree. A `--file` that is not source of the checked programs is ignored, so the hook can pass every edited file.

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

### Glossary

A glossary fixes the words a part of the code uses for its concepts, so one thing has one name and one name means one thing. Glossaries are named at the top level, and a layer opts in by name. A layer without a glossary is not checked, so technical layers keep their own vocabulary:

```ts
glossaries: {
  sales: {
    terms: {
      Customer: { definition: "A person or organisation that has placed at least one order.", avoid: ["client", "buyer"], type: "Customer" },
      ApiClient: { definition: "Our HTTP client for the payments API." },
    },
  },
},
layers: {
  domain: { description: "Domain", files: ["src/domain/**"], glossary: "sales" },
  infrastructure: { description: "Adapters", files: ["src/adapters/**"] },
},
```

A term is written as a type would be named; names match it in any case and in the plural (`customer`, `customers`, `CUSTOMER_LIMIT`). Only names the layer declares are read: variables, parameters, functions, classes, interfaces, types, properties, methods and file names. Imported names, object-literal keys and `override` methods follow a shape someone else defined.

| Rule | Fails when |
| --- | --- |
| `glossary-aliases` | A name uses an avoided word: `clients`, `getClient`, a file `buyers.ts`. The message gives the term, its definition and the rename. Only the head noun counts by default, the last word up to a trailing "by" clause, so `clientOrders` is about orders; `{ match: "any" }` reads every word. A longer term owns its words: `apiClient` is ApiClient. |
| `glossary-types` | For a term with a `type`: a value named after the term has another type (`customer: string`), or a value of the term's type is named after a different term (`order: Customer`). A union, array, set, map, promise, subtype or intersection of the type counts as the type; `any` and unresolved types are skipped. Names that ask or relate rather than name (`isCustomer`, `forCustomer`) are not judged. The type must be declared once, at the top level of a file in the layers that follow the glossary. |
| `unused-terms` | A glossary no layer follows, or a term no declared name uses. |

A term's `type` is what lets the check see meaning rather than spelling. It also removes most false positives: `client: HttpClient` is a different thing that happens to share the word, so it is not a finding. Code that uses primitives for domain values (`customerId: string`) gets much less from `glossary-types`; agreeing a term is a good moment to give it a type.

The glossary rules can be set per layer like lint rules, take line exceptions, and their errors can be recorded in the baseline. Two glossaries a layer follows together must not give one word two meanings, and neither may one glossary: a word that is a term and another term's avoided word is a configuration error.

Seed a glossary from the words people and agents actually confuse, ten or twenty at first, in a grilling session at the start of a project or when a misunderstanding surfaces. A word that keeps collecting baselined findings is usually too generic to avoid (`account`, `item`, `module`); rethink the entry rather than excepting it everywhere.

## Adopting on an existing codebase

Turning the rules on in an existing codebase reports every violation at once. Fixing them all first is rarely possible, so adoption happens in one setup step, then file by file:

1. **Describe the codebase** in `architecture.config.ts`: layers by glob over the folders that exist, with the dependencies each layer *should* have. `architecture-check map` lists the layer of every file and the files no layer claims; repeat until it exits 0.
2. **Tune in observe mode.** With `adoption: { mode: "observe" }` the check reports everything and always exits 0.
3. **Record the baseline.** `architecture-check baseline` writes `architecture.baseline.json` (in the root, and in each workspace package with findings): every lint, compiler and dead-code error that exists today, as debt. Commit it.
4. **Enforce.** From then on a check fails on any error the baseline does not record, and fails a change whose touched files still carry recorded debt. Fixed debt is removed from the baseline automatically.

`architecture-check adopt --prompt` prints step-by-step instructions for an agent doing this adoption, including translating Nx tags, ESLint import rules or dependency-cruiser rules into the configuration, wiring the hooks below, and switching off overlapping lint rules only after showing the architecture rules cover them. `architecture-check doctor` exits 0 once adoption is complete.

### The baseline

Each entry records a file, a rule, a message and how many times it occurs:

```json
{
  "version": 1,
  "entries": [
    {"file":"src/domain/order.ts","rule":"no-let","count":2,"message":"Declare this with const and compute a new value instead of reassigning. …"}
  ]
}
```

- **Positions are not recorded**, so moving code within a file or reordering imports leaves the baseline unchanged. Numbers in messages are masked (`File has # lines`), so a file growing by a line is the same violation. An import violation's message names the file it reached, so each denied import between two files is its own entry.
- **A count above the recorded one is new.** The occurrences cannot be told apart, so all of them are reported, with the recorded and current counts.
- **Only errors are recorded.** Structural findings (classification, project membership, compiler settings, exception syntax) and configuration findings stop or fail the check outright and are never recorded; warnings never fail.
- **It only shrinks.** Any check that finds fewer occurrences than recorded rewrites the file (outside `--ci`). Growth needs `architecture-check baseline --accept --reason "<why>"`, which records the reason on each entry that grew; a newly enabled rule's existing findings are recorded with `architecture-check baseline --rule <id>`. CI fails growth whose reason was not recorded in the change, so a hand edit of the file does not pass.
- **One file per workspace package**, sorted, one entry per line, so branches touching different packages do not conflict. A three-way merge driver resolves conflicts that remain (see below).
- **Renamed files keep their debt.** git's rename detection carries entries to the new path. A pure rename does not count as touching the file.

Line exceptions (`// architecture-disable-next-line <rule> -- <reason>`) stay separate from the baseline: an exception is a decision someone made, debt is what is left to fix. `architecture-check status` counts both, per layer.

### What a check judges

Every check analyses the whole project; the change only decides what fails:

| Finding | Meaning | Fails | Editor |
| --- | --- | --- | --- |
| new | Not in the baseline | always (exit 1) | error |
| touched | Recorded, in a file the change touches, under a rule set to fix on touch | with `--staged`, `--worktree` or `--since` (exit 3) | warning |
| baselined | Recorded debt, file untouched or the rule is no-new on touch | never | faded hint |

The change comes from git: `--staged` (staged files, for pre-commit), `--worktree` (the working tree against HEAD, plus untracked files, for agents) or `--since <ref>` (everything since the merge base with `<ref>`, for CI). Because the analysis covers every file, a change that breaks an untouched file, such as an export left unused there, is still a new error.

Which recorded debt a touched file must fix is set per rule:

```ts
adoption: {
  onTouch: {
    default: "fix",                        // the default: a changed file fixes its recorded debt
    rules: { "allowed-imports": "no-new" }, // the default for imports: fixing one can mean a refactor
  },
},
```

Debt accepted with a reason in the same change is not failed as touched.

### Wiring it in

| Where | Command | Notes |
| --- | --- | --- |
| Agent, after each edit | `architecture-check --format agent --file <file>` | Exit 2 shows the output to the agent. |
| Agent, before finishing | `architecture-check --format agent --worktree` | Blocks finishing while a touched file has debt. |
| Pre-commit | `architecture-check --staged` | Stages the pruned baseline. Works from husky, lefthook, simple-git-hooks or `.git/hooks`. |
| CI | `architecture-check --since origin/main --ci --summary summary.md` | Never writes. Also fails growth without a reason (exit 4) and a baseline that lists fixed debt (exit 5). The summary is Markdown for a pull-request comment, with a Mermaid graph of denied imports. |

For Claude Code, in `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [{ "matcher": "Edit|Write|MultiEdit", "hooks": [{ "type": "command", "command": "f=$(jq -r '.tool_input.file_path // empty'); [ -z \"$f\" ] || pnpm exec architecture-check --format agent --file \"$f\"" }] }],
    "Stop": [{ "hooks": [{ "type": "command", "command": "pnpm exec architecture-check --format agent --worktree" }] }]
  }
}
```

The merge driver, once per clone, with `architecture.baseline.json merge=architecture-baseline` in `.gitattributes`:

```sh
git config merge.architecture-baseline.driver "pnpm exec architecture-check baseline merge %O %A %B"
```

It applies each side's change in count to the common ancestor's, so one branch's fix and another's accepted growth both survive. A CODEOWNERS entry for `architecture.baseline.json` gets growth reviewed.

### Seeing where it stands

```sh
architecture-check status                   # per layer: files, compliant files, new errors, recorded debt by rule, exceptions
architecture-check status --since main      # and how recorded debt changed since main
architecture-check check ui                 # only the findings files in layer ui own
architecture-check check ui --incoming      # denied imports from other layers into ui
architecture-check graph                    # each layer's used dependencies, ✗ denied imports with counts, ○ unused grants
architecture-check graph --format mermaid   # or json, or dot for Graphviz; --layer ui expands one layer into its directories
architecture-check --fixable-in 1           # only files one error away from compliant
```

### Clearing mechanical debt in one sweep

Some fixes need no judgement, so waiting for each file to be touched only delays them:

```sh
architecture-check fix --rule file-naming               # renames files to the naming case; updates imports and the baseline
architecture-check fix --rule no-deep-relative-imports  # rewrites ../../../ imports through the tsconfig's path aliases
architecture-check --fix                                # the lint fixes that are safe
```

`fix` takes `--path <glob>` to sweep part of the codebase. A rename that needs a chosen name (a missing prefix or required suffix), or would move the file out of its layer, is listed for a person instead. `architecture-check rules --json` says which rules each kind of automatic fix covers.

### Speed

Lint and compiler results are cached per file in `node_modules/.cache/architecture-rules/`, keyed on the file, its policy and the content of every file it imports, directly or not, so a change to a type a file depends on checks that file again. Declaration files, lockfiles, package manifests, the configuration and the checker's own build are part of every key. Dead code depends on every file and is reused only while nothing changed. Opening the TypeScript projects is not cached and sets the floor: on a 960-file monorepo a check takes about 19 seconds cold, 4.5 warm, and 7 to 9 after editing one file.

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
architecture-check --staged | --worktree | --since <ref> [--ci]   # also fail recorded debt in the files a change touches
architecture-check --format agent                 # for agent hooks: only what must change, on stderr, exit 2 on failure
architecture-check check <layer>... [--incoming]  # one layer's findings, or the imports into it
architecture-check status | graph | map | doctor  # see Adopting on an existing codebase
architecture-check baseline [--accept --reason <why>] [--rule <id>]
architecture-check fix --rule <id> [--path <glob>]
architecture-check explain no-let                 # what a rule checks, why, and what to write instead
architecture-check rules --json                   # every rule, in plain terms
architecture-check adopt --prompt | --agent-snippet
```

Exit codes: 0 passes; 1 new errors (or any other failure); 2 agent format failed; 3 a touched file still has recorded debt; 4 the baseline grew without a reason (`--ci`); 5 the baseline lists fixed debt (`--ci`).

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

`architecture-check lsp` is a language server: on every save, and when files change on disk, it runs exactly the check the command runs and publishes its findings, with the same rule ids, messages and positions, each linked to its rule's page. A configuration that does not load is shown on `architecture.config.ts`. With a baseline, recorded debt shows as a faded hint, and as a warning once the file differs from HEAD, since the change must then fix it.

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
- `--json` replaced `--format json`; `--format` now takes `text`, `json` or `agent`. The text output is grouped by file with a summary.
- `explain` also takes a rule id: `architecture-check explain no-let`.

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
