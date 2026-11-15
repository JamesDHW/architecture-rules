<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not use unchecked type assertions

`no-type-assertions` · Lint rule · error by default

Do not use unchecked type assertions in application code. Type-preserving constructs such as as const and satisfies remain allowed.

A chained assertion such as value as unknown as Project is reported once. When a dependency's declarations lag its runtime, add a .d.ts augmentation instead of asserting. Otherwise use a reasoned line suppression.

Escape hatches move type errors away from their cause and make readers trust claims the compiler cannot verify.

## What to write instead

Validate or narrow the value with a type guard, a schema parse or satisfies, instead of asserting its type.

## When to make an exception

Attaching a brand to a value that is already validated, or bridging two third-party types that are the same at runtime.

```ts
// architecture-disable-next-line no-type-assertions -- <the concrete reason this line needs it>
```

## Workarounds to avoid

Code like this satisfies the rule's wording while missing its point.

### A type guard that only claims the type

```ts
const isProject = (value: unknown): value is Project => typeof value === "object";
```

The predicate asserts the type without checking its fields, so the cast has only moved. Check every field the type promises, or parse the value with a schema.

No rule reports this; review has to catch it.

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**as const is allowed**

```ts
const labels = { draft: "Draft" } as const;
```

**satisfies is allowed**

```ts
const status = "draft" satisfies "draft" | "active";
```

### Reported

**as Type is banned**

```ts
const project = input as Project;
```

> Do not use type assertions. Prefer validation, narrowing, or as const. See rule no-type-assertions.

**a chained assertion is reported once**

```ts
const project = input as unknown as Project;
```

> Do not use type assertions. Prefer validation, narrowing, or as const. See rule no-type-assertions.

**an assertion of a const assertion is reported once**

```ts
const labels = ({ draft: "Draft" } as const) as Labels;
```

> Do not use type assertions. Prefer validation, narrowing, or as const. See rule no-type-assertions.

**angle-bracket assertion is banned**

```ts
const project = <Project>input;
```

> Do not use type assertions. Prefer validation, narrowing, or as const. See rule no-type-assertions.
