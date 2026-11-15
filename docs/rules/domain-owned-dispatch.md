<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Dispatch domain actions through their owning reducer

`domain-owned-dispatch` · Lint rule · error by default

When a reducer delegates behavior to domain reducers, represent those domains explicitly in the action type. The parent dispatches exhaustively by domain; each child dispatches exhaustively over its own action union. A single-domain reducer may retain a flat action union. Events affecting multiple domains need an explicit coordinating owner, not an arbitrary split by action-name prefix.

```
Good: switch (event.domain) {
  case "admin": return reduceAdmin(state, event.action);
  case "create": return reduceCreate(state, event.action);
  default: return event satisfies never;
}
Bad: switch (action.type) {
  case "adminPanel":
  case "adminForm": return reduceAdmin(state, action);
}
Also bad: trying child reducers until one returns a non-null handled result.
Adding a child action should not require editing its parent's routing labels.
```

Native switch-exhaustiveness enforcement remains responsible for union coverage. This custom syntax check recognizes functions named reduce or reduce followed by an uppercase letter, with identifier state/action parameters. In a switch on the second parameter's .type, it rejects multiple explicit labels returning the same reduceX(firstParameter, secondParameter) call, grouped or separate. Case bodies must contain only that return, optionally enclosed in bare blocks. It does not infer domain ownership, resolve reducer aliases, inspect transformed arguments or effectful case bodies, or detect nullable handled-result protocols. Those remain agent/review obligations. Ordinary shared behavior cases and single-domain flat reducers are not prohibited merely because they are long. No automatic fix can safely invent domain boundaries or migrate action producers.

## What to write instead

Route by an explicit domain field and let the child reducer own its action union.

## When to make an exception

Only when complying would make the code worse, and the reason can be stated concretely.

```ts
// architecture-disable-next-line domain-owned-dispatch -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**hierarchical exhaustive routing**

```ts
type Event =
        | { domain: 'admin'; action: { type: 'input' } }
        | { domain: 'create'; action: { type: 'start' } };
        const reduce = (state: unknown, event: Event) => {
          switch (event.domain) {
            case 'admin': return reduceAdmin(state, event.action);
            case 'create': return reduceCreate(state, event.action);
            default: return event satisfies never;
          }
        };
```

**shared ordinary behavior**

```ts
const reduce = (state, action) => { switch (action.type) { case 'idle': case 'loading': return showPending(state, action); } };
```

**flat single-domain implementation**

```ts
const reduce = (state, action) => { switch (action.type) { case 'input': return { ...state, input: action.input }; case 'reset': return initialState; } };
```

**single delegated label**

```ts
const reduce = (state, action) => { switch (action.type) { case 'admin': return reduceAdmin(state, action); } };
```

**different child reducers**

```ts
const reduce = (state, action) => { switch (action.type) { case 'admin': return reduceAdmin(state, action); case 'create': return reduceCreate(state, action); } };
```

**default is not a second explicit label**

```ts
const reduce = (state, action) => { switch (action.type) { case 'admin': default: return reduceAdmin(state, action); } };
```

**trailing labels have no target**

```ts
const reduce = (state, action) => { switch (action.type) { case 'a': return reduceAdmin(state, action); case 'b': } };
```

**case bodies with effects are outside enforcement**

```ts
const reduce = (state, action) => { switch (action.type) { case 'a': case 'b': log(action); return reduceAdmin(state, action); } };
```

**transformed state is outside enforcement**

```ts
const reduce = (state, action) => { switch (action.type) { case 'a': case 'b': return reduceAdmin(state.admin, action); } };
```

**nested domain payload is not unchanged forwarding**

```ts
const reduce = (state, action) => { switch (action.type) { case 'a': case 'b': return reduceAdmin(state, action.action); } };
```

**unrelated switch subject**

```ts
const reduce = (state, action) => { switch (other.type) { case 'a': case 'b': return reduceAdmin(state, action); } };
```

**non-reducer function**

```ts
function render(state, action) { switch (action.type) { case 'a': case 'b': return reduceAdmin(state, action); } }
```

**nested callback is not the reducer**

```ts
const reduce = (state, action) => { return items.map(() => { switch (action.type) { case 'a': case 'b': return reduceAdmin(state, action); } }); };
```

**intervening body consumes pending labels**

```ts
const reduce = (state, action) => { switch (action.type) { case 'a': return state; case 'b': return reduceAdmin(state, action); } };
```

**anonymous default export is not a named reducer**

```ts
export default function (state, action) { switch (action.type) { case 'a': case 'b': return reduceAdmin(state, action); } }
```

**switch outside any function**

```ts
switch (action.type) { case 'a': case 'b': reduceAdmin(state, action); }
```

**destructured parameters are outside enforcement**

```ts
const reduce = ({ state }, action) => { switch (action.type) { case 'a': case 'b': return reduceAdmin(state, action); } };
```

### Reported

**grouped child action labels**

```ts
const reduce = (state, action) => { switch (action.type) { case 'adminPanel': case 'adminForm': return reduceAdmin(state, action); } };
```

> Do not enumerate child actions to route to reduceAdmin. Dispatch by an explicit domain and let the child own its action union. See rule domain-owned-dispatch.

**separate child action returns**

```ts
const reduce = (state, action) => { switch (action.type) { case 'a': return reduceAdmin(state, action); case 'other': return state; case 'b': return reduceAdmin(state, action); } };
```

> Do not enumerate child actions to route to reduceAdmin. Dispatch by an explicit domain and let the child own its action union. See rule domain-owned-dispatch.

**braced body**

```ts
const reduce = (state, action) => { switch (action.type) { case 'a': case 'b': { { return reduceAdmin(state, action); } } } };
```

> Do not enumerate child actions to route to reduceAdmin. Dispatch by an explicit domain and let the child own its action union. See rule domain-owned-dispatch.

**named reducer declaration with different parameter names**

```ts
function reduceApp(previous, event) { switch (event.type) { case 'a': case 'b': return reduceAdmin(previous, event); } }
```

> Do not enumerate child actions to route to reduceAdmin. Dispatch by an explicit domain and let the child own its action union. See rule domain-owned-dispatch.

**labels before and after a default body**

```ts
const reduce = (state, action) => { switch (action.type) { case 'a': default: return reduceAdmin(state, action); case 'b': { return reduceAdmin(state, action); } } };
```

> Do not enumerate child actions to route to reduceAdmin. Dispatch by an explicit domain and let the child own its action union. See rule domain-owned-dispatch.

**function expression reducer**

```ts
const reduceApp = function(previous, event) { switch (event.type) { case 'a': case 'b': return reduceAdmin(previous, event); } };
```

> Do not enumerate child actions to route to reduceAdmin. Dispatch by an explicit domain and let the child own its action union. See rule domain-owned-dispatch.

**one diagnostic per child**

```ts
const reduce = (state, action) => { switch (action.type) { case 'a': case 'b': return reduceAdmin(state, action); case 'c': case 'd': return reduceCreate(state, action); } };
```

> Do not enumerate child actions to route to reduceAdmin. Dispatch by an explicit domain and let the child own its action union. See rule domain-owned-dispatch.

> Do not enumerate child actions to route to reduceCreate. Dispatch by an explicit domain and let the child own its action union. See rule domain-owned-dispatch.
