<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Warn on deeply ascending relative imports

`no-deep-relative-imports` · Lint rule · warn by default

Warn when an import ascends three or more parent directories. Use the owning module's alias when crossing to a top-level area rather than navigating the repository with ../../../ paths.

A deeply ascending path obscures the dependency's ownership and is fragile under file moves.

## What to write instead

Import through a module alias (package exports or a #subpath import) instead of ../../../.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line no-deep-relative-imports -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**one parent**

```ts
import { Project } from "../Project.js";
```

**two parents**

```ts
import { Project } from "../../domain/Project.js";
```

**alias import**

```ts
import { Project } from "@projects/domain/Project.js";
```

**local export without a source**

```ts
export const project = 1;
```

### Reported

**three parents**

```ts
import { Project } from "../../../domain/Project.js";
```

> Do not import through three or more parent directories. Use a module alias. See rule no-deep-relative-imports.

**named re-export through three parents**

```ts
export { Project } from "../../../domain/Project.js";
```

> Do not import through three or more parent directories. Use a module alias. See rule no-deep-relative-imports.

**star re-export through three parents**

```ts
export * from "../../../domain/Project.js";
```

> Do not import through three or more parent directories. Use a module alias. See rule no-deep-relative-imports.
