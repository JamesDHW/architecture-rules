<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Name things with the glossary's words

`glossary-aliases` · Glossary check, in layers that follow a glossary · error by default

In a layer that follows a glossary, a name must not use a word the glossary avoids for one of its terms: with Customer avoiding "client", `client`, `clients` and `getClient` are findings, and the message gives the term and its definition. Two words for one thing make readers, and agents, wonder whether they are two things.

Only names the layer declares are read: variables, parameters, functions, classes, interfaces, types, properties, methods and file names. Imported names, object-literal keys and `override` methods are someone else's choice. Only the head noun counts by default, the last word of a compound up to a trailing "by" clause, so `clientOrders` is about orders and is not a finding; set the option `match: "any"` to read every word. Longer terms win, so with a term ApiClient, `apiClient` is that term, not the avoided "client".

When the term has a `type`, a value whose type is some other object type is a different thing that happens to share the word: `client: HttpClient` is not a finding.

## What to write instead

Rename to the glossary's term: client becomes customer.

## When to make an exception

The name is fixed by something outside the layer, such as a wire format, and cannot be renamed.

```ts
// architecture-disable-next-line glossary-aliases -- <the concrete reason this line needs it>
```
