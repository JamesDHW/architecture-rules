<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Import a CSS module only from its own component

`css-module-ownership` · Lint rule · error by default

A CSS module belongs to one component. Import X.module.css (or .scss, .sass, .less) only from the component file of the same name, X.tsx or X.jsx: not from another component, and not from its hook or styles file.

```
Good: // Card.tsx
      import styles from "./Card.module.css";
Bad:  // Badge.tsx
      import styles from "./Card.module.css";
      // Card.hook.ts
      import styles from "./Card.module.css";
```

A stylesheet imported by many components becomes a component library without components: changing one class changes screens nobody checked. Styles shared on purpose belong in a primitive component that the others render, or in global tokens.

## What to write instead

Import X.module.css only from X.tsx; share styles by rendering a component, or give this file its own module.

## When to make an exception

A stylesheet is shared on purpose, such as one layout module used by every page of a route group.

```ts
// architecture-disable-next-line css-module-ownership -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**a component imports its own module** · File: `src/ui/Card.tsx`

```tsx
import styles from "./Card.module.css";
export const cardClass = styles.card;
```

**a Sass module** · File: `src/ui/Card.tsx`

```tsx
import styles from "./Card.module.scss";
export const cardClass = styles.card;
```

**a global stylesheet is not a module** · File: `src/app/Layout.tsx`

```tsx
import "./globals.css";
export const layoutName = "layout";
```

### Reported

**another component's module** · File: `src/ui/Badge.tsx`

```tsx
import styles from "./Card.module.css";
export const badgeClass = styles.card;
```

> Card.module.css belongs to Card; only Card.tsx may import it. Render Card, or give this file its own module. See rule css-module-ownership.

**the component's hook** · File: `src/ui/Card.hook.ts`

```ts
import styles from "./Card.module.css";
export const cardClass = styles.card;
```

> Card.module.css belongs to Card; only Card.tsx may import it. Render Card, or give this file its own module. See rule css-module-ownership.
