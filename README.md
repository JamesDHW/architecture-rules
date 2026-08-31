# architecture-rules

Personal architecture and code-quality rules for TypeScript and React projects.

One `defineRule` registry is the source of truth. Oxlint configuration, the custom plugin, and `tsconfig.base.json` are derived from it. Rule explanations live on the rule objects, not in a separate docs tree.

This package is private. Install it from Git (or a local path) rather than npm.

`dist/` is committed on purpose. pnpm will not run `prepare` for git-hosted packages unless they are in `allowBuilds`, so a GitHub/`dlx` install must already contain the built CLI.

## One-shot check

After the repository is on GitHub, from any project:

```bash
pnpm dlx github:JamesDHW/architecture-rules
```

or:

```bash
npx github:JamesDHW/architecture-rules
```

That runs Oxlint with this package's default profile, then `tsc --noEmit` with the architecture TypeScript flags if the target has a `tsconfig.json`.

```bash
pnpm dlx github:JamesDHW/architecture-rules -- --fix
pnpm dlx github:JamesDHW/architecture-rules -- ../other-app
```

Pin a tag once you start using it for real work:

```bash
pnpm dlx github:JamesDHW/architecture-rules#v0.1.0
```

## Permanent install

In the consuming repo:

```bash
pnpm add -D github:JamesDHW/architecture-rules
```

Pin a tag or commit when the profile should stay still:

```bash
pnpm add -D github:JamesDHW/architecture-rules#v0.1.0
```

Then either run the bundled command:

```json
{
  "scripts": {
    "architecture:check": "architecture-check",
    "architecture:fix": "architecture-check --fix"
  }
}
```

or keep a local Oxlint config so you can disable individual personal rule IDs:

```ts
// oxlint.config.ts
import { createConfig } from "architecture-rules";

export default createConfig();
```

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

TypeScript compiler rules are not switched via `createConfig()`. Either run `architecture-check` (which passes the flags to `tsc`) or extend the shared base config:

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

Local path, while iterating on this package:

```bash
pnpm add -D ../architecture-rules
```
