<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Remove type-proven unnecessary conditions

`unnecessary-conditions` · Oxlint rule `typescript/no-unnecessary-condition` · error by default, with options `[{"checkTypePredicates":true,"allowConstantLoopConditions":"never"}]`

Reject tests that TypeScript proves cannot affect the outcome. Receive untrusted inputs as unknown and validate at boundaries. Use a documented scoped exception when inaccurate external declarations genuinely require a defensive check.

```
Good: const parseProject = (input: unknown) => validateProject(input);
Bad: const getProjectName = (project: Project) => {
  if (project === undefined) return "Unknown";
  return project.name;
};
```

Type-guard calls are checked too: isValidationError(error) is reported when error is already a ValidationError. Array.isArray narrows unknown to any[], and every predicate is satisfied by any, so guard arrays through a readonly unknown[] predicate before checking their elements:

```
Good: const isUnknownArray = (value: unknown): value is readonly unknown[] => Array.isArray(value);
      isUnknownArray(value) && value.every(isString)
Bad: Array.isArray(value) && value.every((entry) => typeof entry === "string")
```

Redundant conditions obscure contracts and suggest unsupported uncertainty. Type proofs rely on accurate declarations; they do not validate runtime input.

## What to write instead

Remove the check the types already rule out; accept untrusted input as unknown and validate it at the boundary.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line typescript/no-unnecessary-condition -- <the concrete reason this line needs it>
```
