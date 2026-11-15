<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Name files after one primary concept

`file-naming` · Lint rule · error by default

Name files after one primary concept.

Layers select files by path, never by spelling. Each layer's naming policy then validates every file it selected, so a filename failure cannot move a file out of scope. A filename reads <stem><suffixes>.<extension>: the stem uses one of the configured cases (camelCase, PascalCase, kebab-case or snake_case) and any required prefix. Optional suffixes may stack in any order; requiredSuffix makes one of them mandatory. Exact framework names such as page.tsx exempt naming only.

This package imposes no filename convention of its own: without a naming policy, every filename is allowed.

A predictable filename tells the reader which concept the module holds.

## What to write instead

Rename the file after its one concept, in the case and with a suffix its file type allows.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line file-naming -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**any filename without a naming policy** · File: `src/project-editor.tsx` · Options: `[]`

```ts
export const value = 1;
```

**generic names are not banned without a policy** · File: `src/utils.ts` · Options: `[]`

```ts
export const value = 1;
```

**optional suffixes stack** · File: `tests/noLet.rule.test.ts` · Options: `[{"architecture":{"case":"camelCase","suffixes":[".rule",".test"]}}]`

```ts
export const value = 1;
```

**optional suffixes are optional** · File: `src/noLet.ts` · Options: `[{"architecture":{"case":"camelCase","suffixes":[".rule",".test"]}}]`

```ts
export const value = 1;
```

**required prefix present** · File: `src/useProject.ts` · Options: `[{"architecture":{"case":"camelCase","prefix":"use","allowedNames":["page.tsx"]}}]`

```ts
export const value = 1;
```

**an allowed framework name skips case and prefix** · File: `src/app/page.tsx` · Options: `[{"architecture":{"case":"camelCase","prefix":"use","allowedNames":["page.tsx"]}}]`

```ts
export const value = 1;
```

**required suffix present, with an optional suffix before it** · File: `tests/noLet.rule.test.ts` · Options: `[{"architecture":{"case":"camelCase","requiredSuffix":".test","suffixes":[".rule"]}}]`

```ts
export const value = 1;
```

**required suffix alone** · File: `tests/parseArgs.test.ts` · Options: `[{"architecture":{"case":"camelCase","requiredSuffix":".test","suffixes":[".rule"]}}]`

```ts
export const value = 1;
```

**one of several cases: PascalCase** · File: `src/AdminPanel.tsx` · Options: `[{"architecture":{"case":["PascalCase","kebab-case"],"prefix":["Admin","admin-"]}}]`

```ts
export const value = 1;
```

**one of several cases: kebab-case with its prefix** · File: `src/admin-panel.tsx` · Options: `[{"architecture":{"case":["PascalCase","kebab-case"],"prefix":["Admin","admin-"]}}]`

```ts
export const value = 1;
```

**snake_case with one of several required suffixes** · File: `src/user_account.model.ts` · Options: `[{"architecture":{"case":"snake_case","requiredSuffix":[".model",".view"]}}]`

```ts
export const value = 1;
```

### Reported

**wrong case reports the suffixes it removed** · File: `tests/NoLet.rule.test.ts` · Options: `[{"architecture":{"case":"camelCase","suffixes":[".rule",".test"]}}]`

```ts
export const value = 1;
```

> Filename 'NoLet.rule.test.ts' must use camelCase before .rule.test. See rule file-naming.

**missing prefix** · File: `src/project.ts` · Options: `[{"architecture":{"case":"camelCase","prefix":"use","allowedNames":["page.tsx"]}}]`

```ts
export const value = 1;
```

> Filename 'project.ts' must start with 'use'. See rule file-naming.

**missing required suffix** · File: `tests/fixtures.ts` · Options: `[{"architecture":{"case":"camelCase","requiredSuffix":".test","suffixes":[".rule"]}}]`

```ts
export const value = 1;
```

> Filename 'fixtures.ts' must end with '.test' before its extension. See rule file-naming.

**a known suffix outside the list does not count** · File: `tests/noLet.spec.ts` · Options: `[{"architecture":{"case":"camelCase","requiredSuffix":".test","suffixes":[".rule"]}}]`

```ts
export const value = 1;
```

> Filename 'noLet.spec.ts' must end with '.test' before its extension. See rule file-naming.

**none of several cases** · File: `src/admin_panel.tsx` · Options: `[{"architecture":{"case":["PascalCase","kebab-case"],"prefix":["Admin","admin-"]}}]`

```ts
export const value = 1;
```

> Filename 'admin_panel.tsx' must use PascalCase or kebab-case. See rule file-naming.

**none of several prefixes** · File: `src/UserPanel.tsx` · Options: `[{"architecture":{"case":["PascalCase","kebab-case"],"prefix":["Admin","admin-"]}}]`

```ts
export const value = 1;
```

> Filename 'UserPanel.tsx' must start with 'Admin' or 'admin-'. See rule file-naming.

**kebab-case is not snake_case** · File: `src/user-account.view.ts` · Options: `[{"architecture":{"case":"snake_case","requiredSuffix":[".model",".view"]}}]`

```ts
export const value = 1;
```

> Filename 'user-account.view.ts' must use snake_case before .view. See rule file-naming.
