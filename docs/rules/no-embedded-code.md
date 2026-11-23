<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Keep code and markup out of strings

`no-embedded-code` · Lint rule · error by default

Keep code and markup in files of their own language, not in strings. Report dangerouslySetInnerHTML, __html, innerHTML and outerHTML assignments, eval, new Function, insertAdjacentHTML and document.write, and plain string or template literals whose text reads as JavaScript or HTML.

```
Good: <Script src="/theme.js" strategy="beforeInteractive" />
      const body = html`<p>${greeting}</p>`;
Bad:  <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      const paragraph = `<p style="color:#123">${text}</p>`;
```

Every other rule reads a string as data, so code inside one is never linted, type-checked or formatted, and markup built from interpolated text is a place for injection. A tagged template (sql, gql, html, css) is not reported: the tag names the language, and its tooling can check and escape it. The text check is a pattern match, so it can report prose that only looks like code; give such a line a reasoned exception.

## What to write instead

Move the script, markup or style into a file of its own language, or use a tagged template that names the language.

## When to make an exception

Prose or test data only looks like code, or a platform API takes code as a string and no file can be loaded instead.

```ts
// architecture-disable-next-line no-embedded-code -- <the concrete reason this line needs it>
```

## Examples

These are the rule's test cases: the test suite checks every one.

### Allowed

**prose**

```ts
const title = "Close the window to finish.";
```

**a tagged template names its language**

```ts
const body = html`<p class="lead">${greeting}</p>`;
```

**a module specifier**

```ts
import { renderPage } from "./renderPage.js";
export const page = renderPage;
```

**a comparison in text**

```ts
const hint = "Use a < b and b > c.";
```

**a stream's write is not document.write**

```ts
process.stdout.write("done\n");
```

**ordinary props**

```tsx
const Note = () => <p className="note">Saved</p>;
```

### Reported

**a script in a template literal**

```ts
export const THEME_SCRIPT = `(function () { var key = "theme"; })();`;
```

> This string reads as JavaScript. Move it into a .js, .html or .css file, or mark the language with a tagged template. See rule no-embedded-code.

**markup with attributes in a template literal**

```ts
const paragraph = (text: string): string => `<p style="color:#123">${text}</p>`;
```

> This string reads as HTML. Move it into a .js, .html or .css file, or mark the language with a tagged template. See rule no-embedded-code.

**an element opened and closed in a string**

```ts
const banner = "<strong>Saved</strong>";
```

> This string reads as HTML. Move it into a .js, .html or .css file, or mark the language with a tagged template. See rule no-embedded-code.

**eval**

```ts
eval(source);
```

> eval runs or parses text as code or HTML. Ship it as a file of its own language, or build the DOM through the framework. See rule no-embedded-code.

**new Function**

```ts
const add = new Function("a", "b", "return a + b");
```

> new Function runs or parses text as code or HTML. Ship it as a file of its own language, or build the DOM through the framework. See rule no-embedded-code.

**innerHTML assignment**

```ts
element.innerHTML = markup;
```

> innerHTML runs or parses text as code or HTML. Ship it as a file of its own language, or build the DOM through the framework. See rule no-embedded-code.

**document.write**

```ts
document.write(markup);
```

> document.write runs or parses text as code or HTML. Ship it as a file of its own language, or build the DOM through the framework. See rule no-embedded-code.

**__html outside JSX**

```ts
const props = { __html: markup };
```

> __html runs or parses text as code or HTML. Ship it as a file of its own language, or build the DOM through the framework. See rule no-embedded-code.

**dangerouslySetInnerHTML**

```tsx
const Theme = () => <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
```

> dangerouslySetInnerHTML runs or parses text as code or HTML. Ship it as a file of its own language, or build the DOM through the framework. See rule no-embedded-code.
