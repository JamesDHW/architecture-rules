<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Pass booleans directly instead of branching

`no-boolean-if-else` · Lint rule · error by default

Do not use intermediary branches to pass true and false into the same call. Pass the boolean expression directly.

Stopping the flow instead of accumulating flag assignments prevents unwanted behaviour during a change.

## What to write instead

Pass the boolean in directly: setVisible(isOpen), not if (isOpen) setVisible(true) else setVisible(false).

## When to suppress

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// oxlint-disable-next-line architecture/no-boolean-if-else -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**pass the boolean directly**

```ts
setBillingAddressSameAsShippingAddress(isEmpty(props.billingAddress));
```

**named boolean then pass it**

```ts
const hasBillingAddress = isEmpty(props.billingAddress);
setBillingAddressSameAsShippingAddress(hasBillingAddress);
```

**branches call different functions**

```ts
if (isEmpty(props.billingAddress)) {
  setBillingAddressSameAsShippingAddress(true);
} else {
  setShippingAddress(false);
}
```

**branches pass non-boolean arguments**

```ts
if (isPrimary) {
  setLabel("primary");
} else {
  setLabel("secondary");
}
```

**calls with more than one argument**

```ts
if (isReady) setOpen(true, panel); else setOpen(false, panel);
```

**an else-if branch is not an else branch**

```ts
if (isReady) setOpen(true); else if (isClosing) setOpen(false);
```

### Reported

**same member callee**

```ts
if (isReady) { panel.setOpen(true); } else { panel.setOpen(false); }
```

> Pass the boolean expression into the call directly instead of branching on true and false. See rule no-boolean-if-else.

**if else passing true and false**

```ts
if (isEmpty(props.billingAddress)) {
  setBillingAddressSameAsShippingAddress(true);
} else {
  setBillingAddressSameAsShippingAddress(false);
}
```

> Pass the boolean expression into the call directly instead of branching on true and false. See rule no-boolean-if-else.

**reversed true false without blocks**

```ts
if (isReady) setOpen(false); else setOpen(true);
```

> Pass the boolean expression into the call directly instead of branching on true and false. See rule no-boolean-if-else.
