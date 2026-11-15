<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not rename values through aliases

`no-binding-alias` · Custom lint rule `architecture/no-binding-alias` · error by default

Do not declare a const solely to give an existing binding another name, and do not rename imports with as. Use the original name, or create a genuinely new value through a named transformation. Renaming while destructuring an object property remains allowed.

```
Good: if (shouldEnable) { startSynchronization(); }
Bad: const isEnabled = shouldEnable;
Good: const normalizedProjectName = projectName.trim();
```

To publish one value under a second public name, rename it in the export list: export { listedPackageSchema as registeredPackageSchema }. That states the intent at the module boundary instead of creating a local synonym.

Multiple synonymous names for the same binding force readers to track identity without adding information. This detects direct aliases, not English synonymy between names of genuinely different computations.

Only const declarations are aliases: reassignment is covered by no-let, no-var and no-param-reassign. The global undefined value is not an alias source; a local binding named undefined is.

## What to write instead

Use the original name, or compute a genuinely new value; import names as they are exported.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/no-binding-alias -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**global undefined initialization**

```ts
const compactStart = undefined;
```

**global undefined inside a function**

```ts
const reset = () => { const compactStart = undefined; return compactStart; };
```

**unrelated shadow in sibling scope**

```ts
function other(undefined) {} const compactStart = undefined;
```

**assignment**

```ts
isEnabled = shouldEnable;
```

**let cursor**

```ts
let child = node; child = child.parent;
```

**assignment to undefined**

```ts
let compactStart = 'started'; compactStart = undefined;
```

**computed value is not an alias**

```ts
const normalizedProjectName = projectName.trim();
```

**destructuring rename is allowed**

```ts
const { project: selectedProject } = response;
```

**import without rename**

```ts
import { createProject } from "./createProject.js";
```

**export rename publishes a second public name**

```ts
const listedPackageSchema = createSchema();
export { listedPackageSchema as registeredPackageSchema };
```

### Reported

**parameter named undefined in initializer**

```ts
function example(undefined) { const otherName = undefined; }
```

> Do not alias an existing binding. Use the original name or compute a new value. See rule no-binding-alias.

**block-local undefined**

```ts
{ let undefined = 'value'; const otherName = undefined; }
```

> Do not alias an existing binding. Use the original name or compute a new value. See rule no-binding-alias.

**later lexical declaration still shadows undefined**

```ts
{ const otherName = undefined; let undefined = 'value'; }
```

> Do not alias an existing binding. Use the original name or compute a new value. See rule no-binding-alias.

**imported undefined**

```ts
import { undefined } from './values.js'; const otherName = undefined;
```

> Do not alias an existing binding. Use the original name or compute a new value. See rule no-binding-alias.

**variable alias**

```ts
const isEnabled = shouldEnable;
```

> Do not alias an existing binding. Use the original name or compute a new value. See rule no-binding-alias.

**exported const alias**

```ts
const listedPackageSchema = createSchema();
export const registeredPackageSchema = listedPackageSchema;
```

> Do not alias an existing binding. Use the original name or compute a new value. See rule no-binding-alias.

**import rename**

```ts
import { createProject as buildProject } from "./createProject.js";
```

> Do not rename imports with as. Use the original export name. See rule no-binding-alias.
