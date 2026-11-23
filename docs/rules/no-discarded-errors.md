<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not turn errors into empty values

`no-discarded-errors` · Program check, with type information · error by default

When a branch narrows a value to an error, do something with the error: return it, pass it on, log or report it. Do not turn it into an empty value (null, undefined, [], "", 0, false or a bare return) that the caller cannot tell apart from "nothing there".

```
Good: if (user instanceof DatabaseError) return user;
      if (user instanceof DatabaseError) {
        logger.error("user.lookup_failed", { code: user.code });
        return null;
      }
Bad:  const email = user instanceof DatabaseError ? null : user.email;
      if (place instanceof DecryptError) return null;
```

The check uses the compiler's types: a branch counts as an error branch when its condition is an instanceof test against a class whose instances are assignable to the built-in Error, or a call to a type predicate whose type is. Error-as-value code needs this check the way exception code needs a ban on empty catch blocks: both silently turn a failure into a normal result.

## What to write instead

Return or pass on the error, or log it before returning the empty value.

## When to make an exception

The empty value is the documented meaning of this failure, for example an optional enrichment that may be missing.

```ts
// architecture-disable-next-line no-discarded-errors -- <the concrete reason this line needs it>
```
