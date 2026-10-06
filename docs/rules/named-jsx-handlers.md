<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Name every non-pass-through React handler

`named-jsx-handlers` · Custom lint rule `architecture/named-jsx-handlers` · error by default

JSX may pass through an existing callback directly. Any handler that creates behavior—by adapting arguments, branching, sequencing work, or invoking a domain operation—must be a descriptively named value outside the JSX.

To bind a row's value, JSX may call a named function when every argument is a plain value (a name, a property such as connection.id, or a literal): onClick={handleRemoveClick(connection.id)}. The call cannot hide logic, and TypeScript requires it to return a handler, so onClick={save()} does not compile.

Named handlers keep JSX focused on describing the interface and give behavior a searchable name that communicates the user action it implements.

## What to write instead

Pass a named handler, or bind one with plain values: onClick={handleRemoveClick(row.id)}.

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/named-jsx-handlers -- <the concrete reason this line needs it>
```

## Workarounds to avoid

Code like this satisfies the rule's wording while missing its point.

### Passing a row's id through the DOM

```tsx
const handleRemoveClick = (event: MouseEvent<HTMLButtonElement>) => removeConnection(event.currentTarget.value);
const Row = ({ connection }: RowProps) => <button value={connection.id} onClick={handleRemoveClick}>Remove</button>;
```

A typed id becomes a string read back from the DOM. Bind the handler with the value instead: onClick={handleRemoveClick(connection.id)}.

No rule reports this; review has to catch it.

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**named handler**

```tsx
const Button = () => <button onClick={handleSave}>Save</button>;
```

**pass-through member handler**

```tsx
const Button = () => <button onClick={projectEditor.handleSave}>Save</button>;
```

**handler bound to a row's value**

```tsx
const Row = () => <button onClick={model.handleRemoveClick(connection.id)}>Remove</button>;
```

**handler bound to literals**

```tsx
const Field = () => <input onChange={handleTextChange("describes", 1, true, `x`)} />;
```

**string handler value**

```tsx
const Button = () => <button onClick="save()">Save</button>;
```

**lowercase on-prefixed prop**

```tsx
const Button = () => <Toggle one={() => 1} />;
```

**non-handler prop may be inline**

```tsx
const View = () => <Text value={() => 1} />;
```

### Reported

**inline arrow handler**

```tsx
const Button = () => <button onClick={() => save()}>Save</button>;
```

> Give JSX handler props a named callback. Inline functions hide the user action. See rule named-jsx-handlers.

**bound handler with an inline arrow argument**

```tsx
const Button = () => <button onClick={handleClick(() => save())}>Save</button>;
```

> Give JSX handler props a named callback. Inline functions hide the user action. See rule named-jsx-handlers.

**bound handler with a computed argument**

```tsx
const Button = () => <button onClick={handleClick(id ?? fallback)}>Save</button>;
```

> Give JSX handler props a named callback. Inline functions hide the user action. See rule named-jsx-handlers.

**bound handler with a call argument**

```tsx
const Button = () => <button onClick={handleClick(toId(row))}>Save</button>;
```

> Give JSX handler props a named callback. Inline functions hide the user action. See rule named-jsx-handlers.

**optional call**

```tsx
const Button = () => <button onClick={handleClick?.(id)}>Save</button>;
```

> Give JSX handler props a named callback. Inline functions hide the user action. See rule named-jsx-handlers.

**call on a call result**

```tsx
const Button = () => <button onClick={useModel().handleClick(id)}>Save</button>;
```

> Give JSX handler props a named callback. Inline functions hide the user action. See rule named-jsx-handlers.

**template literal with an expression**

```tsx
const Button = () => <button onClick={handleClick(`row-${id}`)}>Save</button>;
```

> Give JSX handler props a named callback. Inline functions hide the user action. See rule named-jsx-handlers.

**reports the handler expression**

```tsx
const Button = () => <button
  onClick={() => save()}>Save</button>;
```

> Give JSX handler props a named callback. Inline functions hide the user action. See rule named-jsx-handlers.

**inline function handler**

```tsx
const Button = () => <button onClick={function () { save(); }}>Save</button>;
```

> Give JSX handler props a named callback. Inline functions hide the user action. See rule named-jsx-handlers.
