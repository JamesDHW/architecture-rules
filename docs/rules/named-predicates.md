<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Name your predicates

`named-predicates` · Custom lint rule `architecture/named-predicates` · error by default

Name compound conditions in if statements, loop tests, ternary tests, and JSX rendering conditions. Assigned and returned boolean expressions may implement predicates directly. A standalone predicate call needs no additional wrapper.

Exception: an approved nullish/presence guard may precede one property check on that same binding or noncomputed property path. Allow nested properties and comparisons to literals or SCREAMING_SNAKE_CASE constants, not runtime values. Use the polarity that makes the property access safe. Additional domain clauses still require a name. A guard combined with another predicate call should be absorbed into that predicate, preserving any required type narrowing.

```
Good:
  if (!isNullish(project) && project.isArchived) { showArchiveNotice(project); }
  if (isNullish(project) || project.status === "archived") { return unavailable; }
  if (canEditProject(project)) { openProjectEditor(); }
  const canEditProject = (project: Project | null | undefined): boolean => {
    if (isNullish(project)) return false;
    return project.isEditable;
  };
```

```
Bad:
  if (project !== undefined && project.isArchived) { showArchiveNotice(project); }
  if (!isNullish(project) && canEditProject(project)) { openProjectEditor(); }
  if (!isNullish(project) && project.ownerId === currentUser.id) { openProjectEditor(); }
  return <>{(isOwner || isAdministrator) && <EditButton />}</>;
```

Configure nullishGuards and presenceGuards by bare function name. Defaults are ["isNullish"] and [], respectively. Names must not occur in both lists. Matching names does not prove type-guard semantics, purity, or stability of property reads. Implement approved guards as genuine type predicates and review their behavior. Reuse an existing guard helper rather than writing a second one. Explicit standalone null/undefined comparisons remain allowed when the distinction matters. Ternaries using these approved guards solely to default the guarded value must use ?? instead (the same nullish-defaults policy, extended here because this rule owns guard names). This rule does not rewrite guard implementations or forbid their returned null/undefined comparisons.

A predicate name communicates domain intention; the narrow structural exception avoids names that merely restate safe property access.

## What to write instead

Name the compound condition and test the name: const canEdit = isOwner || isAdmin;

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/named-predicates -- <the concrete reason this line needs it>
```

## Workarounds to avoid

Code like this satisfies the rule's wording while missing its point.

### A name that says nothing

```ts
const openProject = () => {
  const condition = isOwner || isAdministrator;
  if (condition) return showEditor();
  return showViewer();
};
```

The rule asks for the decision to be named; condition, check and flag name nothing. Name what is true: const canEditProject = isOwner || isAdministrator;

No rule reports this; review has to catch it.

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**named predicate variable**

```ts
const isEligibleForDiscount =
  user.premium === true || basket.amount > 1000000 || user.orders.length > 20;
if (isEligibleForDiscount) {
  currentOrder.addDiscount(PREMIUM_DISCOUNT_RATE);
}
```

**call expression predicate**

```ts
if (hasAccess(token)) {
  return homepageResponse();
}
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

**comparison is not a logical operation**

```ts
if (basket.amount > 1000000) {
  addDiscount();
}
```

**logical combination assigned, not used as the condition**

```ts
const isAAndB = a && b;
```

```ts
if (!isNullish(project) && project.isArchived) {}
```

```ts
if (isNullish(project) || project.isArchived) {}
```

```ts
if (!isNullish(project) && !project.isArchived) {}
```

```ts
if (!isNullish(project) && project.members.length > 0) {}
```

```ts
if (!isNullish(response.project) && response.project.status === ARCHIVED_STATUS) {}
```

```ts
if (!isNullish(project) && 'archived' === project.status) {}
```

```ts
if (!isNullish(project) && project.balance > -1) {}
```

```ts
if (!isNullish(project) && project.balance > +1) {}
```

```ts
if (!isNullish(project) && project.owner === null) {}
```

```ts
if (!isNullish(project) && project.status === ARCHIVED_STATUS_2) {}
```

```ts
if (!isNullish(project) && project.owner.team.isActive) {}
```

```ts
if (!(isNullish(project)) && project.isArchived) {}
```

```ts
while (!isNullish(project) && project.isPending) {}
```

```ts
for (; !isNullish(project) && project.isPending;) {}
```

```ts
do {} while (isNullish(project) || project.isPending);
```

```ts
const label = !isNullish(project) && project.isArchived ? 'Archived' : 'Other';
```

```ts
const isNullish = (candidate: unknown): candidate is null | undefined => candidate === null || candidate === undefined;
```

```ts
if (project === undefined) {}
```

```ts
if (canEditProject(project)) {}
```

Options: `[{"presenceGuards":["isPresent"]}]`

```ts
if (isPresent(project) && project.isArchived) {}
```

Options: `[{"presenceGuards":["isPresent"]}]`

```ts
if (!isPresent(project) || project.isArchived) {}
```

Options: `[{"nullishGuards":["isAbsent"]}]`

```ts
if (!isAbsent(project) && project.isArchived) {}
```

```tsx
const panel = <>{canEditProject && <EditButton />}</>;
```

```tsx
const panel = <>{(!isNullish(project) && project.isArchived) && <ArchiveNotice />}</>;
```

```tsx
const panel = <>{!isNullish(project) && (project.isArchived && <ArchiveNotice />)}</>;
```

```ts
const label = isNullish(project) ? "Absent" : "Present";
```

```ts
const owner = isNullish(project.owner) ? project.owner : "Unassigned";
```

```ts
const owner = isNullish(project?.owner) ? "Unassigned" : project?.owner;
```

### Reported

**anonymous || in if**

```ts
if (user.premium === true || basket.amount > 1000000 || user.orders.length > 20) {
  currentOrder.addDiscount(PREMIUM_DISCOUNT_RATE);
}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

**anonymous && in while**

```ts
while (hasMessages && !isCancelled) {
  deliver();
}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

**anonymous || in ternary**

```ts
const label = isDraft || isArchived ? "hidden" : "visible";
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (project !== undefined && project.isArchived) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (project === null || project.isArchived) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (isNullish(project) && project.isArchived) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish(project) || project.isArchived) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish(project) && canEditProject(project)) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish(project) && project.ownerId === currentUser.id) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish(project) && project.status === archivedStatus) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish(project) && currentUser.isAdministrator) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish(project) && project.isArchived && isAdministrator) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish(project) && (project.isArchived || project.isDeleted)) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish(loadProject()) && loadProject().isArchived) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish(projects[selectedId]) && projects[selectedId].isArchived) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!guards.isNullish(project) && project.isArchived) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish(project, fallback) && project.isArchived) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isPresent(project) && project.isArchived) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!(isOwner || isAdministrator)) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish(project) && project.balance > -limit) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish(project) && project.name === /archived/) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish(project) && project.status === ARCHIVED__STATUS) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish(project) && project.status == ARCHIVED_STATUS) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish(project) && project?.isArchived) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish(project) && project) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!!isNullish(project) && project.isArchived) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (!isNullish?.(project) && project.isArchived) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
if (isNullish(project) ?? project.isArchived) {}
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```tsx
const panel = <>{isOwner && (isAdministrator && <EditButton />)}</>;
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```tsx
const panel = <>{(isOwner || isAdministrator) && <EditButton />}</>;
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```tsx
const panel = <>{isOwner && isAdministrator && <EditButton />}</>;
```

> Name this compound predicate, or use an approved nullish/presence guard ({{guards}}) before a property check on the same value. Absorb a guard plus predicate call into that predicate, preserving narrowing. See rule named-predicates.

```ts
const name = isNullish(suppliedName) ? "Anonymous" : suppliedName;
```

> Use ?? instead of a guard-based ternary that only supplies a missing-value fallback. See rules named-predicates and nullish-defaults.

```ts
const name = !isNullish(suppliedName) ? suppliedName : "Anonymous";
```

> Use ?? instead of a guard-based ternary that only supplies a missing-value fallback. See rules named-predicates and nullish-defaults.

```ts
const owner = isNullish(project.owner) ? "Unassigned" : project.owner;
```

> Use ?? instead of a guard-based ternary that only supplies a missing-value fallback. See rules named-predicates and nullish-defaults.

Options: `[{"presenceGuards":["isPresent"]}]`

```ts
const name = isPresent(suppliedName) ? suppliedName : "Anonymous";
```

> Use ?? instead of a guard-based ternary that only supplies a missing-value fallback. See rules named-predicates and nullish-defaults.
