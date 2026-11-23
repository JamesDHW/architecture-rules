<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Give each glossary term one type

`glossary-types` · Glossary check, in layers that follow a glossary · error by default

When a glossary term has a `type`, the name and the type must agree. A variable, parameter or property named after the term (`customer`, `customers`) must have that type, an array, set, map, promise or union of it, or a subtype or intersection; a value of that type must not be named after a different term. Names that ask or relate rather than name, such as `isCustomer` and `forCustomer`, are not judged. And the type itself must be declared exactly once, at the top level of a file in the layers that follow the glossary.

This is how the glossary checks meaning rather than spelling: `customer: string` is a customer id or name pretending to be a Customer. Values whose type cannot be determined, such as `any` or an unresolved import, are skipped.

## What to write instead

Give the value the term's type, or rename it to say what it is: customerId, customerName.

## When to make an exception

The value really is the concept but has to be typed loosely, such as raw input before it is parsed.

```ts
// architecture-disable-next-line glossary-types -- <the concrete reason this line needs it>
```
