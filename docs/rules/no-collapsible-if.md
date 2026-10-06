<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not nest a sole if inside another if

`no-collapsible-if` · Custom lint rule `architecture/no-collapsible-if` · error by default

Do not hide simple && or || operations in nested if blocks unless those ifs share a prefix that would otherwise be duplicated.

A nested if whose only body is another if should be combined with &&, retaining short-circuit evaluation order. Give the combination a named predicate unless it qualifies for the approved nullish/presence guard plus property-check exception in named-predicates. Preserve required type narrowing with a suitable type predicate; never introduce an unchecked assertion.

```
Good:
  if (!isNullish(project) && project.isArchived) { showArchiveNotice(project); }
```

```
Bad:
  if (!isNullish(project)) {
    if (project.isArchived) { showArchiveNotice(project); }
  }
```

An outer gate with multiple distinct inner operations remains allowed. Do not use an arbitrary maximum nesting depth as a substitute for meaningful extraction.

## What to write instead

Merge the nested ifs into one condition, and name it when it is compound.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/no-collapsible-if -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**shared prefix with two inner ifs**

```ts
if (a) {
  if (b) {
    pouet();
  }
  if (c) {
    plop();
  }
}
```

**named combined predicate**

```ts
const isAAndB = a && b;
if (isAAndB) {
  pouet();
}
```

**inner if has else**

```ts
if (a) {
  if (b) {
    pouet();
  } else {
    plop();
  }
}
```

### Reported

**nested if as the only body**

```ts
if (a) {
  if (b) {
    pouet();
  }
}
```

> Combine these sole nested ifs in short-circuit order. Name the predicate unless the approved structural-guard exception applies; preserve type narrowing. See rule no-collapsible-if.

**nested if without blocks**

```ts
if (a) if (b) pouet();
```

> Combine these sole nested ifs in short-circuit order. Name the predicate unless the approved structural-guard exception applies; preserve type narrowing. See rule no-collapsible-if.
