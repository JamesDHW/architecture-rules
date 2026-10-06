<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Do not use else

`no-else` · Custom lint rule `architecture/no-else` · error by default

Do not use else or else if. Handle the special case with an early return, throw, break, or continue, then write the remaining path at the same level.

This also applies when both branches must continue to shared work. Extract that exclusive decision into a descriptively named helper with a guard return, then perform the shared work in the caller. Do not replace exclusive branches with independent tests that reread a condition after an effect.

```
Good:
  const notifyProjectMembers = (project: Project): void => {
    sendProjectStatusNotification(project);
    recordNotificationDelivery(project.id);
  };
```

const sendProjectStatusNotification = (project: Project): void => { if (project.isArchived) { sendArchiveNotification(project); return; } sendActiveNotification(project); };

```
Bad:
  if (project.isArchived) {
    sendArchiveNotification(project);
  } else {
    sendActiveNotification(project);
  }
  recordNotificationDelivery(project.id);
```

Put exceptional and terminal cases before the main path, even when that uses a negated condition. Do not invert a guard merely to make its condition positive. For example, if (!canEditProject) return accessDenied; followed by return saveProject(project); is preferred over nesting the successful path. Break and continue require a no-loop-jumps exception, and throw remains restricted by the error-handling policy; naming them here grants no exemption.

An else branch forces the reader to retain the preceding predicate while following later cases. Guard clauses keep each exit independently visible and match the shape of exception-first boolean decisions.

## What to write instead

Return early for the special case and let the main path continue without else.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/no-else -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**exclusive effects extracted before shared work**

```ts
const notifyProjectMembers = (project: Project): void => {
  sendProjectStatusNotification(project);
  recordNotificationDelivery(project.id);
};
const sendProjectStatusNotification = (project: Project): void => {
  if (project.isArchived) {
    sendArchiveNotification(project);
    return;
  }
  sendActiveNotification(project);
};
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

**guard clauses without else**

```ts
if (token.hasExpired()) {
  return loginPageResponse();
}

if (!hasAccess(token)) {
  return accessDeniedResponse();
}

return homepageResponse();
```

### Reported

**nonterminal exclusive effects before shared work**

```ts
const notifyProjectMembers = (project: Project): void => {
  if (project.isArchived) {
    sendArchiveNotification(project);
  } else {
    sendActiveNotification(project);
  }
  recordNotificationDelivery(project.id);
};
```

> Do not use else. Handle the special case, then continue the remaining path. See rule no-else.

**else after if**

```ts
if (isReady) {
  start();
} else {
  wait();
}
```

> Do not use else. Handle the special case, then continue the remaining path. See rule no-else.

**else if chain**

```ts
if (year % 400 === 0) {
  return true;
} else if (year % 4 === 0) {
  return year % 100 !== 0;
} else {
  return false;
}
```

> Do not use else. Handle the special case, then continue the remaining path. See rule no-else.

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

> Do not use else. Handle the special case, then continue the remaining path. See rule no-else.
