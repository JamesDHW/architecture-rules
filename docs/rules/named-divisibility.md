<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Name divisibility checks

`named-divisibility` · Custom lint rule `architecture/named-divisibility` · error by default

Do not test or return an inline remainder comparison such as value % n === 0. Give that check a name, typically isDivisibleBy(value, n).

A named divisibility predicate states the intention and can be reused in exception-first boolean decisions without repeating arithmetic.

## What to write instead

Wrap the remainder test in a named predicate such as isDivisibleBy(value, divisor).

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/named-divisibility -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

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

**block-bodied helper**

```ts
const isDivisibleBy = (value: number, divisor: number): boolean => {
  return value % divisor === 0;
};
```

**named remainder assigned to a predicate**

```ts
const isCenturyLeapYear = year % 400 === 0;
```

**unrelated comparison**

```ts
if (year === 400) return true;
```

### Reported

**inline remainder in if**

```ts
if (year % 400 === 0) return true;
```

> Give this divisibility check a name such as isDivisibleBy. See rule named-divisibility.

**negated remainder in if**

```ts
if (year % 100 !== 0) return true;
```

> Give this divisibility check a name such as isDivisibleBy. See rule named-divisibility.

**yoda remainder comparison**

```ts
if (0 === year % 400) return true;
```

> Give this divisibility check a name such as isDivisibleBy. See rule named-divisibility.

**remainder returned among other statements**

```ts
const isLeapYear = (year: number): boolean => {
  if (isDivisibleBy(year, 400)) return true;
  return year % 4 === 0;
};
```

> Give this divisibility check a name such as isDivisibleBy. See rule named-divisibility.

**messy leap year**

```ts
const isLeapYear = (year: number): boolean => {
  let result: boolean;

  if (year % 400 === 0) {
    result = true;
  } else if (year % 4 === 0) {
    if (year % 100 !== 0) {
      result = true;
    } else {
      result = false;
    }
  } else {
    result = false;
  }

  return result;
};
```

> Give this divisibility check a name such as isDivisibleBy. See rule named-divisibility.
