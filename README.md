# architecture-rules

Personal architecture and code-quality rules for TypeScript and React projects.

One `defineRule` registry is the source of truth. Oxlint configuration, the custom plugin, and `tsconfig.base.json` are derived from it. Rule explanations live on the rule objects, not in a separate docs tree.

This package is private. Install it from Git (or a local path) rather than npm.

## Install

Peer tools the consuming project must also install:

- `oxlint@1.80.0`
- `oxlint-tsgolint`
- `typescript`

Local path, while iterating:

```bash
pnpm add -D ../architecture-rules oxlint@1.80.0 oxlint-tsgolint typescript
```

From GitHub, once the repository is published:

```bash
pnpm add -D github:USER/architecture-rules#v0.1.0 oxlint@1.80.0 oxlint-tsgolint typescript
```

During experimentation a branch reference such as `#main` is fine. Pin a tag or commit for real work.

## Oxlint

```ts
// oxlint.config.ts
import { createConfig } from "architecture-rules";

export default createConfig();
```

The default profile enables every Oxlint-backed personal rule. Disable or weaken them by **personal rule ID**, not by the underlying Oxlint rule name:

```ts
import { createConfig } from "architecture-rules";

export default createConfig({
  rules: {
    "explicit-conditions": "warn",
  },
  overrides: [
    {
      files: ["src/generated/**"],
      reason: "Generated files follow the upstream generator's conventions.",
      rules: {
        "file-naming": "off",
      },
    },
  ],
});
```

Scoped overrides require a `reason` so the next human or agent can tell the deviation is intentional.

TypeScript compiler rules are not switched here. Override those in the consuming project's `tsconfig`.

## TypeScript

```json
{
  "extends": "architecture-rules/tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2024",
    "module": "ESNext",
    "jsx": "react-jsx",
    "noEmit": true
  },
  "include": ["src"]
}
```

The shared base config contains universal type-system flags only.

## Scripts

```json
{
  "scripts": {
    "architecture:check": "oxlint && tsc --noEmit",
    "architecture:fix": "oxlint --fix"
  }
}
```

Type-aware Oxlint rules require `oxlint-tsgolint` in the consuming project.
