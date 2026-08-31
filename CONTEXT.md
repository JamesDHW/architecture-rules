Architecture Rules — Agent Context

Purpose

This repository is intended to become a reusable architecture and code-quality ruleset for TypeScript and React projects.

The goal is broader than ordinary linting. It should encode a personal architectural taste profile strongly enough that code produced by humans or agents is predictably clean, understandable, and structurally consistent.

The working project name is:

architecture-rules

The repository has already been initialized with Git.

Do not assume any other setup has been completed unless it is visible in the repository.

Package manager

Use pnpm.

Do not use npm or yarn commands.

Dependency installation rule

Do not install dependencies without asking first.

Before proposing or running an installation:

Explain what capability is needed.

If multiple reasonable packages or approaches exist, show the choices and their trade-offs.

Recommend a default if useful.

Wait for explicit approval before installing anything.

Do not silently choose dependencies.

This applies to development dependencies as well as runtime dependencies.

Decision-making rule

When there are multiple viable implementation options, do not silently choose one.

Present the meaningful alternatives, explain the trade-offs, and make the selected direction explicit.

Avoid presenting trivial variations as choices when there is no meaningful architectural consequence.

Core design

The central abstraction should be:

defineRule(...)

A rule represents one personal code or architecture preference.

There should not be a separate manually maintained distinction between:

policy

lint rule

documentation

For this project, those are aspects of the same conceptual rule.

A rule should contain, as appropriate:

a stable personal rule ID

a human-readable title

the canonical explanation / reasoning

examples if useful

exceptions if useful

its enforcement mechanism

rule-specific configuration

its implementation when custom enforcement is required

Example shape:

export const explicitConditionsRule = defineRule({
id: "explicit-conditions",

title: "Use explicit conditions for non-boolean values",

description: `
Only boolean-typed expressions may be tested directly.

Compare strings, numbers, objects, and nullish values explicitly according
to the intended condition.

Prefer:

if (projects.length > 0) {}
if (project !== undefined) {}

Avoid:

if (projects.length) {}
if (project) {}

I prefer the exact condition to be visible at the point of use rather than
requiring the reader to reconstruct JavaScript truthiness semantics.
`.trim(),

enforcement: {
// ...
},
});

Documentation philosophy

The rule description should be the canonical documentation.

Do not create a second hand-maintained documentation tree containing duplicated explanations.

The main concern is preventing enforcement and reasoning from drifting apart.

If Markdown documentation, a website, README tables, an agent index, or CLI help is needed later, generate it from the rule definitions.

Preferred direction:

rule definition
|
+--> Oxlint configuration
+--> custom Oxlint implementation
+--> tsconfig.base.json
+--> generated docs / README
+--> agent-facing explanation

Not:

rule implementation <--> separately maintained docs

Enforcement mechanisms

A personal architecture rule may be enforced in different ways.

The likely internal model is conceptually:

type Enforcement =
| NativeOxlintEnforcement
| CustomOxlintEnforcement
| TypeScriptCompilerEnforcement
| AdvisoryEnforcement;

These are implementation mechanisms, not separate policy objects.

Native Oxlint enforcement

Use an existing Oxlint rule when it already expresses the desired semantics well.

Example:

personal rule:
explicit-conditions

implemented by:
typescript/strict-boolean-expressions

Do not reimplement a native Oxlint rule merely to customize its wording unless there is a strong reason.

Custom Oxlint enforcement

Use a custom rule where the project convention is not covered by Oxlint.

Filename conventions are an expected example.

TypeScript compiler enforcement

Some architecture rules belong in the shared TypeScript configuration rather than Oxlint.

Examples include:

strict

exactOptionalPropertyTypes

noUncheckedIndexedAccess

noImplicitReturns

noFallthroughCasesInSwitch

noImplicitOverride

forceConsistentCasingInFileNames

The eventual tsconfig.base.json should contain universal type-safety rules, not project-specific build/runtime settings.

Advisory enforcement

Some preferences are too semantic to enforce reliably.

Examples may include:

keeping a function at one level of abstraction

preferring composition over behavioral flags in nuanced cases

These may remain agent/human review rules while still living in the same rule registry.

Consumer experience

A new project should enable the complete architecture profile by default.

The desired consumer API is approximately:

// oxlint.config.ts
import { createConfig } from "architecture-rules";

export default createConfig();

A consuming project should not need to list every rule individually.

Adding a new default rule to architecture-rules should make it part of the profile automatically when the consuming project updates this dependency.

Consumer overrides

Consumers must be able to disable or weaken individual personal rules.

Importantly, consumers should refer to personal rule IDs, not implementation-specific Oxlint rule names.

Desired API:

import { createConfig } from "architecture-rules";

export default createConfig({
rules: {
"no-for-each": "off",
},

overrides: [
{
files: ["src/generated/**"],
reason: "Generated files follow the upstream generator's conventions.",

      rules: {
        "file-naming": "off",
      },
    },

],
});

The architecture package should translate:

explicit-conditions

into whatever underlying enforcement currently implements it.

For example:

typescript/strict-boolean-expressions

That implementation detail should not leak into consuming repositories.

Where practical, override IDs should be strongly typed from the registered rule IDs.

Scoped exceptions should preferably include a human-readable reason so future humans and agents know that the deviation is intentional.

Shared TypeScript config

The package should expose a shared:

tsconfig.base.json

A consumer should be able to write approximately:

{
"extends": "architecture-rules/tsconfig.base.json",
"compilerOptions": {
"target": "ES2024",
"module": "ESNext",
"jsx": "react-jsx",
"noEmit": true
},
"include": ["src"]
}

The shared base config should contain universal type-system rules only.

Do not put environment-specific or project-layout decisions into the base config unless there is a strong reason.

Generally keep these local to consuming projects:

target

module

moduleResolution

lib

jsx

types

paths

baseUrl

rootDir

outDir

include

exclude

noEmit

The long-term preference is for tsconfig.base.json to be generated from rules whose enforcement mechanism is TypeScript compiler configuration, so the rule reasoning and compiler setting cannot drift.

Rule registry

There should be one internal registry of all personal rules.

Conceptually:

export const rules = [
explicitConditionsRule,
fileNamingRule,
strictTypeScriptRule,
checkedIndexedAccessRule,
// ...
] as const;

From this registry, derive:

the default Oxlint rule configuration

custom plugin exports

the shared TSConfig

personal rule ID types

generated documentation if desired later

Do not duplicate the enabled-rule list in consuming repositories.

Automatic generation of the registry from files may be considered later, but is not required for the initial bootstrap.

Filename rule

A custom filename rule is expected.

The user wants to be able to specify allowed globs in a named object.

A possible configuration direction is:

{
allow: {
entrypoints: [
"**/index.ts",
"**/index.tsx",
],

    tests: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
    ],

    framework: [
      "**/page.tsx",
      "**/layout.tsx",
    ],

},
}

The named groups are useful because they explain why a filename is exempt.

Do not try to express all casing semantics purely through globs.

Globs answer:

Which files / paths are in this category?

The custom checker should handle semantic naming rules such as:

PascalCase

camelCase

allowed suffixes such as .hook.ts

allowed suffixes such as .constants.ts

allowed suffixes such as .schema.ts

banned generic filenames such as utils.ts, helpers.ts, common.ts, or types.ts

The precise configuration schema is not final. If multiple designs are possible, present options before committing.

Personalized violation reasoning

Every personal rule should carry its own explanation.

The goal is that when an agent encounters an architectural violation, it can understand why the rule exists, not merely how to silence it.

For custom rules, diagnostics should include a concise explanation or enough information to locate the rule's canonical description.

Do not duplicate the full rule description into a separately maintained docs file.

Oxlint's custom JS plugin support currently has limitations around propagating custom rule documentation URLs into IDE diagnostics, so do not make the architecture depend on clickable meta.docs.url support being available.

It is still reasonable to populate compatible metadata for future support.

A future helper such as:

architecture-rules explain file-naming

may be useful, but it is not required for the initial bootstrap.

Existing code-style preferences

The wider architecture profile is intended to encode preferences including, but not limited to:

TypeScript

guard clauses for terminal cases

descriptive names for non-obvious compound conditions

simple, side-effect-free ternaries only

explicit exported function return types

arrow functions by default

immutable data by default

recursively readonly domain models

discriminated unions for exclusive states

exhaustive handling of discriminated unions

no unchecked type escapes in application code

branded domain primitives where primitive values are confusable

validation of untrusted boundaries

literal unions instead of enums

type aliases instead of interfaces by default

explicit conditions instead of JavaScript truthiness

?? for missing-value defaults

no forEach

reduce only for simple folds

named semantic constants

semantic boolean prefixes such as is, has, can, should

checked indexed collection access

records for exhaustive value mappings

switches for behavior / variant-specific logic

readonly data and functions rather than mutable application classes

effectful dependencies injected at composition roots

expected application/domain errors returned as values

unexpected programming defects should not be casually normalized into expected application errors

null and undefined

Preferred semantics:

undefined = not provided / not yet known / not initialized
null = explicitly known to have no value
omitted = no instruction / property not supplied

For update inputs:

omitted -> leave unchanged
value -> set
null -> clear

Avoid unnecessarily putting undefined into fully established domain models when loading state can be represented separately.

React

effects only for synchronization with external systems

derived values computed during rendering

user-driven effects initiated from handlers

composition preferred over behavioral flags

named non-pass-through handlers

component behavior generally moved into a component-specific hook

presentational components should remain hook-free

component states rendered with guard returns

no speculative memoization

named exports

explicit JSX props

module-scope components and hooks

named object models from component-specific hooks

component/hook grouping by folder

React accessibility rules should eventually be part of the profile

stable list keys should eventually be part of the profile

Rules of Hooks / exhaustive dependency checks should be enabled

Some of these are architectural/advisory rather than mechanically lintable. Do not force unreliable AST heuristics just to claim full enforcement.

Important nuance about immutability

Do not interpret immutability as forbidding every local assignment in all circumstances.

The intended principle is closer to:

Do not mutate inputs, shared state, or previously observable values. Local mutation may be acceptable while constructing a fresh, unaliased result when that implementation is clearer.

Readonly types are part of the API/type contract, but TypeScript readonly does not guarantee runtime deep immutability or prevent mutation through another mutable alias.

Do not describe readonly as proving that an object can never change.

Source organization direction

A likely initial layout is:

architecture-rules/
├── package.json
├── tsconfig.build.json
├── tsconfig.base.json
├── README.md
├── src/
│ ├── core/
│ │ ├── defineRule.ts
│ │ └── createConfig.ts
│ ├── rules/
│ │ ├── explicitConditions.rule.ts
│ │ ├── fileNaming.rule.ts
│ │ ├── strictTypeScript.rule.ts
│ │ ├── checkedIndexedAccess.rule.ts
│ │ └── index.ts
│ ├── plugin.ts
│ ├── generateTsconfig.ts
│ └── index.ts
└── tests/

This is a direction, not a command to create files without review.

If an alternative layout has meaningful advantages, present the alternatives first.

Distribution direction

Do not publish to npm yet.

The user wants to test this through a GitHub repository first.

The eventual package should be installable from GitHub in consuming repositories.

During experimentation, a branch reference may be acceptable.

Once the package is used seriously, tagged or commit-pinned Git dependencies are preferable for reproducibility.

The repo should be designed so moving to npm later requires minimal architectural change.

Current implementation caution

Do not assume hypothetical commands or code discussed previously were executed.

Before modifying the repository:

inspect the current state

report any meaningful differences from this context

propose the next step

ask before installing any dependency

Working style for this repository

The priorities are:

understandability

architectural consistency

type safety

agent-readable intent

low documentation drift

predictable enforcement

performance, unless a demonstrated need requires otherwise

When an exception is required for performance, security, framework behavior, generated code, or an external API, isolate it behind a descriptive boundary and explain the non-obvious reason.

The system should favor strong defaults with explicit, documented opt-outs.

# Tech implementation

I’d bootstrap this as **`architecture-rules`**. “Architecture tests” is understandable, but `architecture-rules` better describes what the repository contains; you can still call the command people run `architecture:check`.

The key design goal should be:

```text
one defineRule()
    ↓
description / rationale
    ↓
Oxlint configuration OR custom checker OR tsconfig option
    ↓
tests
```

No separately maintained docs.

Oxlint currently supports TypeScript config files, custom ESLint-compatible JS plugins, IDE diagnostics, and type-aware linting. Type-aware linting requires `oxlint-tsgolint`; custom JS plugins are still alpha, so I would deliberately pin/test Oxlint upgrades centrally in this repo. ([Oxc][1])

## 2. Create this structure

```text
architecture-rules/
├── package.json
├── tsconfig.build.json
├── tsconfig.base.json              # generated
├── README.md
├── src/
│   ├── core/
│   │   ├── defineRule.ts
│   │   └── createConfig.ts
│   ├── rules/
│   │   ├── explicitConditions.rule.ts
│   │   ├── fileNaming.rule.ts
│   │   ├── strictTypeScript.rule.ts
│   │   ├── uncheckedIndexedAccess.rule.ts
│   │   └── index.ts
│   ├── plugin.ts
│   ├── generateTsconfig.ts
│   └── index.ts
└── tests/
```

I would **not** have `docs/`.

If you later want pretty Markdown docs, generate them from the rule objects.

---

# 3. Define your fundamental abstraction

`src/core/defineRule.ts`:

```ts
import type { Rule } from "eslint";

export type Severity = "off" | "warn" | "error";

export type OxlintRuleConfiguration =
  | Severity
  | readonly [Severity, ...(readonly unknown[])];

type OxlintEnforcement = {
  readonly type: "oxlint";
  readonly rule: string;
  readonly configuration: OxlintRuleConfiguration;
};

type CustomOxlintEnforcement = {
  readonly type: "custom-oxlint";
  readonly configuration: OxlintRuleConfiguration;
  readonly implementation: Rule.RuleModule;
};

type TypeScriptEnforcement = {
  readonly type: "typescript";
  readonly compilerOptions: Readonly<Record<string, unknown>>;
};

type AdvisoryEnforcement = {
  readonly type: "advisory";
};

export type Enforcement =
  | OxlintEnforcement
  | CustomOxlintEnforcement
  | TypeScriptEnforcement
  | AdvisoryEnforcement;

export type ArchitectureRule<Id extends string = string> = {
  readonly id: Id;
  readonly title: string;

  /**
   * This is the canonical documentation for the rule.
   *
   * Do not maintain a separate prose version elsewhere.
   */
  readonly description: string;

  readonly enforcement: Enforcement;
};

export const defineRule = <const RuleDefinition extends ArchitectureRule>(
  rule: RuleDefinition,
): RuleDefinition => {
  return rule;
};
```

This is the important abstraction.

A "rule" is now **your opinion**, not necessarily an Oxlint rule.

---

# 4. Define a native Oxlint-backed rule

`src/rules/explicitConditions.rule.ts`:

```ts
import { defineRule } from "../core/defineRule.js";

export const explicitConditionsRule = defineRule({
  id: "explicit-conditions",

  title: "Use explicit conditions for non-boolean values",

  description: `
Only boolean-typed expressions may be tested directly.

Compare strings, numbers, objects, and nullish values explicitly according
to the intended condition.

Prefer:

  if (projects.length > 0) {}
  if (project !== undefined) {}

Avoid:

  if (projects.length) {}
  if (project) {}

I prefer the exact condition to be visible at the point of use rather than
requiring the reader to reconstruct JavaScript truthiness semantics.
  `.trim(),

  enforcement: {
    type: "oxlint",

    rule: "typescript/strict-boolean-expressions",

    configuration: [
      "error",
      {
        allowString: false,
        allowNumber: false,
        allowNullableObject: false,
      },
    ],
  },
});
```

Your prose and enforcement now live together.

---

# 5. Define TypeScript compiler rules the same way

`src/rules/strictTypeScript.rule.ts`:

```ts
import { defineRule } from "../core/defineRule.js";

export const strictTypeScriptRule = defineRule({
  id: "strict-typescript",

  title: "Use TypeScript strict mode",

  description: `
Enable TypeScript's strict family of type-system checks.

I want compiler uncertainty to be surfaced rather than silently widened
into permissive types. New strict checks introduced by TypeScript should
become part of the default rather than requiring individual opt-in.
  `.trim(),

  enforcement: {
    type: "typescript",

    compilerOptions: {
      strict: true,
    },
  },
});
```

`src/rules/uncheckedIndexedAccess.rule.ts`:

```ts
import { defineRule } from "../core/defineRule.js";

export const uncheckedIndexedAccessRule = defineRule({
  id: "checked-indexed-access",

  title: "Check every indexed collection access",

  description: `
Treat array and record lookups as potentially undefined unless the type
system can prove the requested entry exists.

Runtime collections do not guarantee that an index or arbitrary key is
present. I want that uncertainty represented directly in the type.
  `.trim(),

  enforcement: {
    type: "typescript",

    compilerOptions: {
      noUncheckedIndexedAccess: true,
    },
  },
});
```

Do the same for:

```text
exactOptionalPropertyTypes
noImplicitReturns
noFallthroughCasesInSwitch
noImplicitOverride
forceConsistentCasingInFileNames
```

This has a nice property: `tsconfig.base.json` stops being handwritten configuration. It becomes a **compiled output of your architecture rules**.

---

# 6. Add the custom filename rule

Your custom rule lives in exactly the same conceptual place.

`src/rules/fileNaming.rule.ts`:

```ts
import path from "node:path";
import picomatch from "picomatch";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Name files after one primary concept.

Use PascalCase for React components and classes, camelCase for ordinary
functions and modules, and controlled suffixes such as .hook.ts,
.constants.ts, and .schema.ts.

Generic dumping-ground filenames such as utils.ts, helpers.ts, common.ts,
and types.ts are not allowed.

Framework-required or otherwise exceptional filenames may be explicitly
allowed through named glob groups.

A predictable filename should give me a strong idea of the concept I will
find inside the module.
`.trim();

const isPascalCase = (value: string): boolean => {
  return /^[A-Z][A-Za-z0-9]*$/.test(value);
};

const isCamelCase = (value: string): boolean => {
  return /^[a-z][A-Za-z0-9]*$/.test(value);
};

const isAllowedByGlob = (
  filename: string,
  groups: Readonly<Record<string, readonly string[]>>,
): boolean => {
  return Object.values(groups).some((patterns) =>
    patterns.some((pattern) => picomatch.isMatch(filename, pattern)),
  );
};

export const fileNamingRule = defineRule({
  id: "file-naming",

  title: "Name files after one primary concept",

  description: DESCRIPTION,

  enforcement: {
    type: "custom-oxlint",

    configuration: [
      "error",
      {
        allow: {
          entrypoints: ["**/index.ts", "**/index.tsx"],

          tests: [
            "**/*.test.ts",
            "**/*.test.tsx",
            "**/*.spec.ts",
            "**/*.spec.tsx",
          ],
        },
      },
    ],

    implementation: {
      meta: {
        type: "suggestion",

        docs: {
          description: DESCRIPTION,
        },

        schema: [
          {
            type: "object",
            properties: {
              allow: {
                type: "object",
                additionalProperties: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
              },
            },
            additionalProperties: false,
          },
        ],

        messages: {
          invalidFilename:
            "Filename '{{filename}}' does not match the architecture filename rules. " +
            "Files should be named after one primary concept.",
        },
      },

      create(context) {
        return {
          Program(node) {
            const relativeFilename = context.filename.replaceAll("\\", "/");

            const options = context.options[0] ?? {};
            const allow =
              "allow" in options && typeof options.allow === "object"
                ? options.allow
                : {};

            if (
              isAllowedByGlob(
                relativeFilename,
                allow as Readonly<Record<string, readonly string[]>>,
              )
            ) {
              return;
            }

            const filename = path.basename(relativeFilename);

            let stem: string;

            if (filename.endsWith(".hook.ts")) {
              stem = filename.slice(0, -".hook.ts".length);

              if (isPascalCase(stem)) return;
            } else if (filename.endsWith(".tsx")) {
              stem = filename.slice(0, -".tsx".length);

              if (isPascalCase(stem)) return;
            } else if (filename.endsWith(".ts")) {
              stem = filename.slice(0, -".ts".length);

              if (isPascalCase(stem) || isCamelCase(stem)) return;
            } else {
              return;
            }

            context.report({
              node,
              messageId: "invalidFilename",
              data: {
                filename,
              },
            });
          },
        };
      },
    },
  },
});
```

I'd refine this rule considerably later, but this gets the architecture working.

Oxlint custom rules can use normal ESLint-compatible AST traversal, options, schemas, diagnostics and IDE support. A `Program` visitor is also explicitly recommended when you need logic to run for every file. ([Oxc][3])

---

# 7. Have exactly one internal registry

`src/rules/index.ts`:

```ts
import { explicitConditionsRule } from "./explicitConditions.rule.js";
import { fileNamingRule } from "./fileNaming.rule.js";
import { strictTypeScriptRule } from "./strictTypeScript.rule.js";
import { uncheckedIndexedAccessRule } from "./uncheckedIndexedAccess.rule.js";

export const rules = [
  explicitConditionsRule,
  fileNamingRule,
  strictTypeScriptRule,
  uncheckedIndexedAccessRule,
] as const;

export type ArchitectureRuleId = (typeof rules)[number]["id"];
```

This is the **only** list you maintain.

Later I'd generate this file too, but don't optimize that yet.

---

# 8. Generate the custom Oxlint plugin

`src/plugin.ts`:

```ts
import type { ESLint, Rule } from "eslint";

import { rules } from "./rules/index.js";

const customRules = Object.fromEntries(
  rules.flatMap((rule) => {
    if (rule.enforcement.type !== "custom-oxlint") {
      return [];
    }

    return [[rule.id, rule.enforcement.implementation]];
  }),
) as Record<string, Rule.RuleModule>;

const plugin: ESLint.Plugin = {
  meta: {
    name: "architecture-rules",
  },

  rules: customRules,
};

export default plugin;
```

So:

```text
file-naming
```

automatically becomes:

```text
architecture/file-naming
```

to Oxlint.

---

# 9. Create the consumer-facing `createConfig()`

This is the piece every new repo will use.

`src/core/createConfig.ts`:

```ts
import { defineConfig } from "oxlint";

import { rules, type ArchitectureRuleId } from "../rules/index.js";

type Severity = "off" | "warn" | "error";

type RuleOverride =
  | Severity
  | {
      readonly severity: Severity;
      readonly reason: string;
    };

type ConfigOptions = {
  readonly rules?: Partial<Record<ArchitectureRuleId, RuleOverride>>;

  readonly overrides?: readonly {
    readonly files: readonly string[];
    readonly reason: string;

    readonly rules: Partial<Record<ArchitectureRuleId, RuleOverride>>;
  }[];
};

const getSeverity = (
  override: RuleOverride | undefined,
): Severity | undefined => {
  if (typeof override === "string") return override;

  return override?.severity;
};

const getOxlintRuleName = (
  rule: (typeof rules)[number],
): string | undefined => {
  if (rule.enforcement.type === "oxlint") {
    return rule.enforcement.rule;
  }

  if (rule.enforcement.type === "custom-oxlint") {
    return `architecture/${rule.id}`;
  }

  return undefined;
};

export const createConfig = (options: ConfigOptions = {}) => {
  const configuredRules = Object.fromEntries(
    rules.flatMap((rule) => {
      const oxlintRuleName = getOxlintRuleName(rule);

      if (oxlintRuleName === undefined) {
        return [];
      }

      const override = options.rules?.[rule.id];
      const severity = getSeverity(override);

      if (severity !== undefined) {
        return [[oxlintRuleName, severity]];
      }

      return [[oxlintRuleName, rule.enforcement.configuration]];
    }),
  );

  const overrides = options.overrides?.map((override) => ({
    files: [...override.files],

    rules: Object.fromEntries(
      Object.entries(override.rules).flatMap(
        ([architectureRuleId, ruleOverride]) => {
          const rule = rules.find(
            (candidate) => candidate.id === architectureRuleId,
          );

          if (rule === undefined) return [];

          const oxlintRuleName = getOxlintRuleName(rule);

          if (oxlintRuleName === undefined) return [];

          return [[oxlintRuleName, getSeverity(ruleOverride)]];
        },
      ),
    ),
  }));

  return defineConfig({
    plugins: [
      "eslint",
      "typescript",
      "unicorn",
      "oxc",
      "import",
      "react",
      "jsx-a11y",
      "promise",
    ],

    jsPlugins: [
      {
        name: "architecture",
        specifier: "architecture-rules/plugin",
      },
    ],

    options: {
      typeAware: true,
    },

    rules: configuredRules,

    overrides,
  });
};
```

This is the part I'd spend some time unit-testing.

It creates the abstraction you wanted:

```ts
"file-naming": "off"
```

instead of exposing:

```ts
"architecture/file-naming": "off"
```

or:

```ts
"typescript/strict-boolean-expressions": "off"
```

to consumers.

---

# 10. Generate `tsconfig.base.json`

`src/generateTsconfig.ts`:

```ts
import { writeFile } from "node:fs/promises";

import { rules } from "./rules/index.js";

const compilerOptions = Object.assign(
  {},
  ...rules.flatMap((rule) => {
    if (rule.enforcement.type !== "typescript") {
      return [];
    }

    return [rule.enforcement.compilerOptions];
  }),
);

const tsconfig = {
  $schema: "https://json.schemastore.org/tsconfig",

  compilerOptions,
};

const outputUrl = new URL("../tsconfig.base.json", import.meta.url);

await writeFile(outputUrl, `${JSON.stringify(tsconfig, null, 2)}\n`);
```

So the generated file might become:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

TypeScript supports package/Node-style resolution in `extends`, so consumers can inherit this directly from the installed package. ([TypeScript][4])

---

# 11. Package exports

Make `package.json` approximately:

```json
{
  "name": "architecture-rules",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "files": ["dist", "tsconfig.base.json", "README.md"],
  "exports": {
    ".": "./dist/index.js",
    "./plugin": "./dist/plugin.js",
    "./tsconfig.base.json": "./tsconfig.base.json"
  },
  "scripts": {
    "build:typescript": "tsc -p tsconfig.build.json",
    "generate": "node dist/generateTsconfig.js",
    "build": "npm run build:typescript && npm run generate",
    "test": "vitest run",
    "check": "npm run build && npm test",
    "prepare": "npm run build"
  },
  "dependencies": {
    "picomatch": "^4.0.0"
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "oxlint": "1.80.0",
    "oxlint-tsgolint": "^7.0.0",
    "typescript": "7.0.2",
    "vitest": "^3.0.0"
  },
  "peerDependencies": {
    "oxlint": "1.80.0"
  }
}
```

Keep:

```json
"private": true
```

for now. It prevents accidental npm publishing; it does not stop you using the repository as a Git dependency.

The `prepare` script is particularly useful here: npm runs `prepare` when installing a Git dependency, including installing that repository's dependencies first, so your `dist/` does not need to be committed. ([npm Docs][5])

---

# 12. Build configuration

`tsconfig.build.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noEmitOnError": true
  },
  "include": ["src"]
}
```

And `src/index.ts`:

```ts
export { createConfig } from "./core/createConfig.js";
export { defineRule } from "./core/defineRule.js";

export { rules, type ArchitectureRuleId } from "./rules/index.js";
```

Then:

```bash
npm run build
```

You should now have:

```text
dist/
tsconfig.base.json
```

---

# 13. Test the package before GitHub

You don't need GitHub to test consumption.

Create a temporary sibling project and install the directory:

```bash
npm install --save-dev ../architecture-rules
```

npm also runs `prepare` when installing/linking a local package. ([npm Docs][6])

Then the consumer gets:

```ts
// oxlint.config.ts

import { createConfig } from "architecture-rules";

export default createConfig();
```

and:

```json
{
  "extends": "architecture-rules/tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2024",
    "module": "ESNext",
    "jsx": "react-jsx",
    "noEmit": true
  },
  "include": ["src"]
}
```

Install the runtime tools in that consumer:

```bash
npm install --save-dev \
  oxlint@1.80.0 \
  oxlint-tsgolint@7 \
  typescript@7.0.2
```

Type-aware Oxlint needs `oxlint-tsgolint` installed. ([Oxc][7])

Then:

```json
{
  "scripts": {
    "architecture:check": "oxlint && tsc --noEmit",
    "architecture:fix": "oxlint --fix"
  }
}
```

I like `architecture:check` much more than `lint`.

---

# 14. Verify opt-outs

Your consumer should immediately be able to do:

```ts
import { createConfig } from "architecture-rules";

export default createConfig({
  overrides: [
    {
      files: ["src/generated/**"],
      reason: "Generated files follow the upstream generator's conventions.",

      rules: {
        "file-naming": "off",
      },
    },

    {
      files: ["scripts/**"],
      reason: "These are disposable migration scripts.",

      rules: {
        "explicit-conditions": "warn",
      },
    },
  ],
});
```

I strongly like requiring:

```ts
reason: "...";
```

for scoped exceptions.

You're building this specifically for agent-generated code, so an exception should tell the next agent:

> this is deliberate; don't "fix" it.

---

# 15. Add tests immediately

For custom rules, Oxlint supplies a `RuleTester` compatible with ESLint's model. ([Oxc][3])

So `fileNaming.rule.test.ts` should test:

```text
ProjectEditor.tsx       ✓
ProjectEditor.hook.ts   ✓
createProject.ts        ✓

project_editor.tsx      ✗
project-editor.tsx      ✗
utils.ts                ✗ eventually
```

Also test your infrastructure itself:

```text
createConfig()
  ✓ includes every Oxlint rule
  ✓ includes every custom rule
  ✓ excludes TypeScript-only rules from Oxlint
  ✓ translates personal IDs into actual Oxlint IDs
  ✓ applies global disables
  ✓ applies glob overrides

generateTsconfig()
  ✓ contains every TypeScript enforcement
```

That infrastructure matters more than any individual rule at this stage.

---

# 16. Push to GitHub

Once local-package consumption works:

```bash
git add .
git commit -m "Bootstrap architecture rules"

git branch -M main
git remote add origin git@github.com:YOUR_USER/architecture-rules.git
git push -u origin main
```

Then a real project can install:

```bash
npm install --save-dev \
  github:YOUR_USER/architecture-rules#main \
  oxlint@1.80.0 \
  oxlint-tsgolint@7 \
  typescript@7.0.2
```

npm natively supports GitHub dependencies and branch/tag/commit references. ([npm Docs][5])

During experimentation, `#main` is fine.

Once you're using it for real work, tag releases:

```bash
git tag v0.1.0
git push origin v0.1.0
```

and consume:

```json
{
  "devDependencies": {
    "architecture-rules": "github:YOUR_USER/architecture-rules#v0.1.0"
  }
}
```

That stops a change to your architecture repository from unexpectedly changing every project's install.

## One thing I would postpone

Don't build the explanation CLI, generated website, automatic rule-index generation, or elaborate rule categories yet.

First prove this loop:

```text
defineRule
   ↓
native Oxlint / custom Oxlint / TypeScript
   ↓
createConfig()
   ↓
consumer
   ↓
override by personal rule ID
```

Then add **5–10 of your existing preferences** and see where the abstraction feels awkward. That will tell us whether `defineRule` needs more concepts such as `examples`, `exceptions`, `fix`, `options`, or multiple enforcement mechanisms.

There is one current limitation to keep in mind: custom Oxlint rules can provide rich diagnostics and participate in the language server, but custom JS rules still cannot use TypeScript type information. Use Oxlint's native type-aware rules for those cases rather than rebuilding them yourself. ([Oxc][8])

[1]: https://oxc.rs/docs/guide/usage/linter/config.html?utm_source=chatgpt.com "Configuration | Oxlint | The JavaScript Oxidation Compiler"
[2]: https://www.npmjs.com/package/oxlint?activeTab=versions&utm_source=chatgpt.com "oxlint - npm"
[3]: https://oxc.rs/docs/guide/usage/linter/writing-js-plugins.html?utm_source=chatgpt.com "Writing JS Plugins | Oxlint | The JavaScript Oxidation Compiler"
[4]: https://www.typescriptlang.org/tsconfig/extends.html?utm_source=chatgpt.com "TypeScript: TSConfig Option: extends"
[5]: https://docs.npmjs.com/files/package.json/?utm_source=chatgpt.com "package.json | npm Docs"
[6]: https://docs.npmjs.com/cli/using-npm/scripts/?utm_source=chatgpt.com "Scripts | npm Docs"
[7]: https://oxc.rs/docs/guide/usage/linter/type-aware?utm_source=chatgpt.com "Type-Aware Linting | Oxlint | The JavaScript Oxidation Compiler"
[8]: https://oxc.rs/docs/guide/usage/linter/js-plugins "JS Plugins | Oxlint | The JavaScript Oxidation Compiler"
