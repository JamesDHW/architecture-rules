<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Name files after one primary concept

`file-naming` · Custom lint rule `architecture/file-naming` · error by default

Name files after one primary concept.

Architecture file types select files by paths, never by spelling. Their naming policy validates every selected source file. A filename failure cannot make a file fall out of scope. Exact framework names exempt naming only.

This package does not impose filename conventions on its own. The consuming project must supply banned basenames, suffix/case rules, and named allow groups. With none of those options, every filename is allowed.

A predictable filename should give me a strong idea of the concept I will find inside the module.

## What to write instead

Rename the file after its one concept, in the case and with a suffix its file type allows.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/file-naming -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**any filename when the client supplies no policy** · File: `src/project-editor.tsx`

```ts
export const ProjectEditor = () => null;
```

**generic dumping-ground names when the client supplies no policy** · File: `src/utils.ts`

```ts
export const identity = <Value>(value: Value) => value;
```

**PascalCase component with client suffix rules** · File: `src/ProjectEditor.tsx` · Options: `[{"allow":{"framework":["**/page.tsx","**/layout.tsx"]},"banned":["utils.ts","utils.tsx","helpers.ts","helpers.tsx"],"suffixes":{".hook.ts":"pascal",".constants.ts":"camel",".tsx":"pascal",".ts":"pascalOrCamel"}}]`

```ts
export const ProjectEditor = () => null;
```

**PascalCase hook module with client suffix rules** · File: `src/ProjectEditor.hook.ts` · Options: `[{"allow":{"framework":["**/page.tsx","**/layout.tsx"]},"banned":["utils.ts","utils.tsx","helpers.ts","helpers.tsx"],"suffixes":{".hook.ts":"pascal",".constants.ts":"camel",".tsx":"pascal",".ts":"pascalOrCamel"}}]`

```ts
export const useProjectEditor = () => ({});
```

**camelCase module with client suffix rules** · File: `src/createProject.ts` · Options: `[{"allow":{"framework":["**/page.tsx","**/layout.tsx"]},"banned":["utils.ts","utils.tsx","helpers.ts","helpers.tsx"],"suffixes":{".hook.ts":"pascal",".constants.ts":"camel",".tsx":"pascal",".ts":"pascalOrCamel"}}]`

```ts
export const createProject = () => ({});
```

**camelCase constants suffix with client suffix rules** · File: `src/foo.constants.ts` · Options: `[{"allow":{"framework":["**/page.tsx","**/layout.tsx"]},"banned":["utils.ts","utils.tsx","helpers.ts","helpers.tsx"],"suffixes":{".hook.ts":"pascal",".constants.ts":"camel",".tsx":"pascal",".ts":"pascalOrCamel"}}]`

```ts
export const foo = 1;
```

**framework page allowed by named glob group** · File: `src/app/page.tsx` · Options: `[{"allow":{"framework":["**/page.tsx","**/layout.tsx"]},"banned":["utils.ts","utils.tsx","helpers.ts","helpers.tsx"],"suffixes":{".hook.ts":"pascal",".constants.ts":"camel",".tsx":"pascal",".ts":"pascalOrCamel"}}]`

```ts
export const Page = () => null;
```

**architecture policy: the longest matching suffix is removed before the case check** · File: `tests/noLet.rule.test.ts` · Options: `[{"architecture":{"case":"camel","suffixes":[".test",".rule.test"]}}]`

```ts
export const cases = [];
```

**architecture policy: required prefix present** · File: `src/useProject.ts` · Options: `[{"architecture":{"case":"camel","prefix":"use","allowedNames":["page.tsx"]}}]`

```ts
export const useProject = () => ({});
```

**architecture policy: allowed framework name skips case and prefix** · File: `src/app/page.tsx` · Options: `[{"architecture":{"case":"camel","prefix":"use","allowedNames":["page.tsx"]}}]`

```ts
export const Page = () => null;
```

### Reported

**architecture policy: wrong case reports the suffix it removed** · File: `tests/NoLet.rule.test.ts` · Options: `[{"architecture":{"case":"camel","suffixes":[".test",".rule.test"]}}]`

```ts
export const cases = [];
```

> Filename 'NoLet.rule.test.ts' must use camel case before .rule.test. See rule file-naming.

**architecture policy: missing prefix** · File: `src/project.ts` · Options: `[{"architecture":{"case":"camel","prefix":"use","allowedNames":["page.tsx"]}}]`

```ts
export const project = {};
```

> Filename 'project.ts' must start with 'use'. See rule file-naming.

**snake_case component with client suffix rules** · File: `src/project_editor.tsx` · Options: `[{"allow":{"framework":["**/page.tsx","**/layout.tsx"]},"banned":["utils.ts","utils.tsx","helpers.ts","helpers.tsx"],"suffixes":{".hook.ts":"pascal",".constants.ts":"camel",".tsx":"pascal",".ts":"pascalOrCamel"}}]`

```ts
export const ProjectEditor = () => null;
```

> Filename '{{filename}}' does not match the architecture filename rules. Files should be named after one primary concept. See rule file-naming.

**kebab-case component with client suffix rules** · File: `src/project-editor.tsx` · Options: `[{"allow":{"framework":["**/page.tsx","**/layout.tsx"]},"banned":["utils.ts","utils.tsx","helpers.ts","helpers.tsx"],"suffixes":{".hook.ts":"pascal",".constants.ts":"camel",".tsx":"pascal",".ts":"pascalOrCamel"}}]`

```ts
export const ProjectEditor = () => null;
```

> Filename '{{filename}}' does not match the architecture filename rules. Files should be named after one primary concept. See rule file-naming.

**generic utils filename with client banned list** · File: `src/utils.ts` · Options: `[{"allow":{"framework":["**/page.tsx","**/layout.tsx"]},"banned":["utils.ts","utils.tsx","helpers.ts","helpers.tsx"],"suffixes":{".hook.ts":"pascal",".constants.ts":"camel",".tsx":"pascal",".ts":"pascalOrCamel"}}]`

```ts
export const identity = <Value>(value: Value) => value;
```

> Filename '{{filename}}' is a generic dumping-ground name. Name the file after one primary concept. See rule file-naming.
