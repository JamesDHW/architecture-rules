<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Return a boolean expression instead of a true/false tail

`prefer-single-boolean-return` · Lint rule · error by default

When the remaining path of a function or block is only "if condition return true; return false" or the reverse, return the condition instead.

Early returns that exit with true or false remain allowed when later paths return something other than the opposite literal. Those are exception-first decisions, not a boolean wrapped in a detour.

## What to write instead

Return the condition itself instead of if (condition) return true; return false;

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/prefer-single-boolean-return -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**branch performs work before returning**

```ts
if (isReady) { recordAccess(); return true; } return false;
```

**preferred leap year**

```ts
const isDivisibleBy = (value: number, divisor: number): boolean =>
  value % divisor === 0;

const isLeapYear = (year: number): boolean => {
  if (isDivisibleBy(year, 400)) return true;
  if (isDivisibleBy(year, 100)) return false;
  return isDivisibleBy(year, 4);
};
```

**early true then a non-literal return**

```ts
if (isAdmin) return true;
return hasAccess(user);
```

**same literal is not a true/false detour**

```ts
if (isReady) return true;
return true;
```

**else branch performs work before returning**

```ts
const check = () => { if (isReady) return true; else { recordAccess(); return false; } };
```

### Reported

**final else of an else-if chain**

```ts
const check = () => { if (isAdmin) return true; else if (isBlocked) return false; else return true; };
```

> Return the boolean expression (negated for the reverse case). For non-boolean inputs, first express the intended comparison explicitly. See rule prefer-single-boolean-return.

**boolean tail in switch case**

```ts
const check = () => { switch (status) { case "ready": if (isMember) return true; return false; default: return canAccess(); } };
```

> Return the boolean expression (negated for the reverse case). For non-boolean inputs, first express the intended comparison explicitly. See rule prefer-single-boolean-return.

**if true then return false**

```ts
if (isReady) return true;
return false;
```

> Return the boolean expression (negated for the reverse case). For non-boolean inputs, first express the intended comparison explicitly. See rule prefer-single-boolean-return.

**if false then return true**

```ts
if (isBlocked) {
  return false;
}
return true;
```

> Return the boolean expression (negated for the reverse case). For non-boolean inputs, first express the intended comparison explicitly. See rule prefer-single-boolean-return.

**if else returning opposite booleans**

```ts
if (isReady) {
  return true;
} else {
  return false;
}
```

> Return the boolean expression (negated for the reverse case). For non-boolean inputs, first express the intended comparison explicitly. See rule prefer-single-boolean-return.

**nested leftover after flattening else**

```ts
if (isDivisibleBy(year, 400)) return true;
if (isDivisibleBy(year, 4)) {
  if (!isDivisibleBy(year, 100)) return true;
  return false;
}
return false;
```

> Return the boolean expression (negated for the reverse case). For non-boolean inputs, first express the intended comparison explicitly. See rule prefer-single-boolean-return.
