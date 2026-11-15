<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Destructure component props in the parameter list

`destructured-props` · Lint rule · error by default

Destructure a React component's props in its parameter list. The parameter list then shows every prop the component uses, and the body reads names rather than props.name.

```
Good: export const RunList: FC<RunListProps> = ({ runs, emptyText }) => { ... };
Bad:  export const RunList: FC<RunListProps> = (props) => { ... props.runs ... };
```

A component is a PascalCase binding to a function that is typed as FC or FunctionComponent, or that returns JSX.

## What to write instead

Destructure the props in the parameter list: ({ title, onClose }) =>.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line destructured-props -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**destructured FC**

```tsx
const RunList: FC<RunListProps> = ({ runs }) => <ul>{runs}</ul>;
```

**rest props**

```tsx
const Button: FC<ButtonProps> = ({ tone, ...buttonProps }) => <button {...buttonProps} />;
```

**no props**

```tsx
const Home = () => <main />;
```

**hook taking an object**

```tsx
const useRunList = (props: RunListProps) => props.runs;
```

**camelCase function returning JSX**

```tsx
const renderRow = (row: Row) => <li>{row.name}</li>;
```

**PascalCase non-component**

```tsx
const Parser = (text: string) => text.trim();
```

**JSX only inside a nested function**

```tsx
const Parser = (text: string) => {
  const render = () => <b>{text}</b>;
  return render;
};
```

**anonymous default export**

```tsx
export default function (props: Props) { return <ul>{props.runs}</ul>; }
```

**unwrapped call result**

```tsx
const RunList = styled((props: Props) => <ul>{props.runs}</ul>);
```

### Reported

**props parameter on an FC**

```tsx
const RunList: FC<RunListProps> = (props) => <ul>{props.runs}</ul>;
```

> Destructure {{name}}'s props in its parameter list. See rule destructured-props.

**untyped component returning JSX**

```tsx
const RunList = (props: RunListProps) => {
  return <ul>{props.runs}</ul>;
};
```

> Destructure {{name}}'s props in its parameter list. See rule destructured-props.

**memo-wrapped component**

```tsx
const RunList = memo((props: RunListProps) => <ul>{props.runs}</ul>);
```

> Destructure {{name}}'s props in its parameter list. See rule destructured-props.

**React.FC annotation**

```tsx
const RunList: React.FC<RunListProps> = (props) => null;
```

> Destructure {{name}}'s props in its parameter list. See rule destructured-props.

**React.forwardRef wrapper**

```tsx
const RunList = React.forwardRef(function (props: RunListProps, ref) { return <ul ref={ref}>{props.runs}</ul>; });
```

> Destructure {{name}}'s props in its parameter list. See rule destructured-props.

**props parameter with a default**

```tsx
const RunList = (props = defaults) => <ul>{props.runs}</ul>;
```

> Destructure {{name}}'s props in its parameter list. See rule destructured-props.

**function declaration**

```tsx
function RunList(props: RunListProps) { return <ul>{props.runs}</ul>; }
```

> Destructure {{name}}'s props in its parameter list. See rule destructured-props.
