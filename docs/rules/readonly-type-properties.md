<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Declare data as recursively readonly

`readonly-type-properties` · Lint rule · error by default

Mark every data-model property and collection readonly, and compose nested models that are themselves readonly. Mutable types may exist only inside isolated adapters where an external API requires mutation.

Readonly types prevent mutation through this contract and tell readers that consumers must treat the value as immutable.

## What to write instead

Mark every property and index signature readonly.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line readonly-type-properties -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**readonly properties and index signature**

```ts
type Project = {
  readonly id: string;
  readonly members: readonly string[];
  readonly [key: string]: unknown;
};
```

**method signatures are not treated as data properties**

```ts
type Clock = {
  now(): Date;
};
```

### Reported

**mutable property**

```ts
type Project = {
  id: string;
};
```

> Type-literal properties and index signatures must be readonly. See rule readonly-type-properties.

**mutable index signature**

```ts
type Bag = {
  [key: string]: string;
};
```

> Type-literal properties and index signatures must be readonly. See rule readonly-type-properties.
