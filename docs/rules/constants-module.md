<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Put semantic constants in a constants module

`constants-module` · Lint rule · error by default

Declare SCREAMING_SNAKE_CASE semantic constants in a file ending with .constants.ts, including constants used by only one consumer.

A consistent suffix makes policy values easy to locate and keeps executable modules focused on behavior.

## What to write instead

Move the SCREAMING_CASE constant into a sibling *.constants.ts module and import it.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line constants-module -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**screaming snake in a constants module** · File: `src/ProjectQueue.constants.ts`

```ts
export const QUEUE_BACK_OFF_SECONDS = 30;
```

**camelCase local is not a semantic constant** · File: `src/scheduleRetry.ts`

```ts
const retryDelaySeconds = 30;
```

**single uppercase acronym is allowed inline** · File: `src/fetchResource.ts`

```ts
const HTTP = "https";
```

**a let binding is not a semantic constant** · File: `src/scheduleRetry.ts`

```ts
let QUEUE_BACK_OFF_SECONDS = 30;
```

**a destructured binding is not checked** · File: `src/scheduleRetry.ts`

```ts
const { QUEUE_BACK_OFF_SECONDS } = settings;
```

### Reported

**screaming snake outside a constants module** · File: `src/scheduleRetry.ts`

```ts
const QUEUE_BACK_OFF_SECONDS = 30;
```

> Declare '{{name}}' in a *.constants.ts module. See rule constants-module.

**the message names the constant** · File: `src/scheduleRetry.ts`

```ts
export const MAX_RETRIES = 3;
```

> Declare 'MAX_RETRIES' in a *.constants.ts module. See rule constants-module.
