<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Expose mixed logical operator precedence

`grouped-logical-operators` · Custom lint rule `architecture/grouped-logical-operators` · error by default

Parenthesize mixed && and || operations to make their grouping explicit.

```
Good: const canEditProject = isAdministrator || (isOwner && isProjectActive);
Bad: const canEditProject = isAdministrator || isOwner && isProjectActive;
A chain using only one logical operator needs no extra parentheses. Do not
require parentheses around every comparison. JavaScript already requires
explicit grouping when mixing ?? with && or ||. This rule applies inside
named predicate implementations as well as at their use sites.
```

## What to write instead

Parenthesize each && group inside an ||: isAdmin || (isOwner && isDraft).

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/grouped-logical-operators -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

```ts
const canEdit = isAdministrator || (isOwner && isActive);
```

```ts
const canEdit = isOwner && isActive && hasAccess;
```

```ts
const canEdit = (isOwner || isAdministrator) && isActive;
```

### Reported

```ts
const canEdit = isAdministrator || isOwner && isActive;
```

> Parenthesize mixed && and || operations to expose their grouping. See rule grouped-logical-operators.

```ts
const canEdit = isOwner && isActive || isAdministrator;
```

> Parenthesize mixed && and || operations to expose their grouping. See rule grouped-logical-operators.
