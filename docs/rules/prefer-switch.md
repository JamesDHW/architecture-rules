<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Prefer switch over repeated equality ifs

`prefer-switch` · Custom lint rule `architecture/prefer-switch` · error by default

Use a switch for adjacent terminal decisions comparing the same value with strict equality. Each branch must directly return or throw, optionally after other statements. Independent effectful if statements are not alternatives: combining them can change execution count or the value tested later.

This syntax check does not prove a closed union or stable property reads. Value-only mappings may instead use an exhaustive readonly record. It does not enforce records or replace React render-state guard returns. Branches containing JSX are left to the component-state convention.

## What to write instead

Use a switch on the value, or a readonly record when each case only maps to a value.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/prefer-switch -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**independent effects may change the discriminant**

```ts
if (project.status === "draft") publish(project); if (project.status === "active") notify(project);
```

**loose equality is not switch equality**

```ts
if (status == 0) return pending; if (status == 1) return ready;
```

**computed property access may perform work**

```ts
if (project[getKey()] === "draft") return pending; if (project[getKey()] === "active") return ready;
```

**intervening work must not be moved**

```ts
if (status === "draft") return pending; refresh(); if (status === "active") return ready;
```

**single equality if**

```ts
if (food.type === VEGETABLE) {
  return steam(food);
}
return food;
```

**ifs on different properties**

```ts
if (food.type === VEGETABLE) {
  return steam(food);
}
if (food.origin === LOCAL) {
  return grill(food);
}
```

**switch is already used**

```ts
switch (food.type) {
  case VEGETABLE:
    return steam(food);
  case PROTEIN:
    return grill(food);
  default:
    return food;
}
```

**a member discriminant outranks the identifier compared with it**

```ts
const choose = () => { if (a === a.b) return 1; if (a === a.c) return 2; };
```

**optional member access is not a discriminant**

```ts
const choose = () => { if (a?.b === 1) return 1; if (a?.b === 2) return 2; };
```

**a nonterminal branch disqualifies its whole run**

```ts
const choose = () => { if (s === 1) return 1; if (s === 2) refresh(); if (s === 3) return 3; if (s === 4) return 4; };
```

**an else chain ending in a nonterminal branch**

```ts
const choose = () => { if (s === 1) return 1; else if (s === 2) return 2; else if (s === 3) { refresh(); } };
```

```tsx
const ProjectPage = () => { if (project.status === "loading") return <Loading />; if (project.status === "failure") return <Failure />; return <Project />; };
```

### Reported

**literal before the discriminant**

```ts
const choose = () => { if (VEGETABLE === food.type) return steam(food); if (PROTEIN === food.type) return grill(food); };
```

> Use a switch for these terminal decisions, or an exhaustive readonly record for a value mapping. Preserve evaluation order and property-read behavior. See rule prefer-switch.

**throw is a terminal branch**

```ts
const choose = () => { if (status === "a") return 1; if (status === "b") throw failure; };
```

> Use a switch for these terminal decisions, or an exhaustive readonly record for a value mapping. Preserve evaluation order and property-read behavior. See rule prefer-switch.

**a run may start after an if with else**

```ts
const choose = () => { if (s === 1) return 1; else refresh(); if (s === 2) return 2; if (s === 3) return 3; };
```

> Use a switch for these terminal decisions, or an exhaustive readonly record for a value mapping. Preserve evaluation order and property-read behavior. See rule prefer-switch.

**an else chain and a following run are reported separately**

```ts
const choose = () => { if (s === 1) return 1; else if (s === 2) return 2; if (s === 3) return 3; if (s === 4) return 4; };
```

> Use a switch for these terminal decisions, or an exhaustive readonly record for a value mapping. Preserve evaluation order and property-read behavior. See rule prefer-switch.

**else if chain on the same member**

```ts
if (food.type === VEGETABLE) {
  return steam(food);
} else if (food.type === PROTEIN) {
  return grill(food);
} else {
  return food;
}
```

> Use a switch for these terminal decisions, or an exhaustive readonly record for a value mapping. Preserve evaluation order and property-read behavior. See rule prefer-switch.

**consecutive ifs on the same member**

```ts
if (food.type === VEGETABLE) {
  return steam(food);
}
if (food.type === PROTEIN) {
  return grill(food);
}
return food;
```

> Use a switch for these terminal decisions, or an exhaustive readonly record for a value mapping. Preserve evaluation order and property-read behavior. See rule prefer-switch.
