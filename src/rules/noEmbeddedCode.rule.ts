import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";
import { childNode, identifierName, stringProperty, type SyntaxNode } from "./syntaxNode.js";
import { withPlaceholders } from "./messagePlaceholders.js";
import { CODE_SINK_CALLS, HTML_SINKS, MARKUP_PATTERN, MODULE_SOURCE_PARENTS, SCRIPT_PATTERN } from "./noEmbeddedCode.constants.js";

const DESCRIPTION = `
Keep code and markup in files of their own language, not in strings. Report
dangerouslySetInnerHTML, __html, innerHTML and outerHTML assignments, eval,
new Function, insertAdjacentHTML and document.write, and plain string or
template literals whose text reads as JavaScript or HTML.

Good: <Script src="/theme.js" strategy="beforeInteractive" />
      const body = html\`<p>\${greeting}</p>\`;
Bad:  <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      const paragraph = \`<p style="color:#123">\${text}</p>\`;

Every other rule reads a string as data, so code inside one is never
linted, type-checked or formatted, and markup built from interpolated text
is a place for injection. A tagged template (sql, gql, html, css) is not
reported: the tag names the language, and its tooling can check and escape
it. The text check is a pattern match, so it can report prose that only
looks like code; give such a line a reasoned exception.
`.trim();

const isTagged = (node: Rule.Node): boolean => node.parent?.type === "TaggedTemplateExpression";

const isModuleSource = (node: Rule.Node): boolean => MODULE_SOURCE_PARENTS.has(node.parent?.type ?? "");

/** The name a key or member property spells: innerHTML for x.innerHTML or { innerHTML: … }. */
const propertyName = (node: SyntaxNode | undefined): string | undefined => {
  if (node === undefined) return undefined;
  return identifierName(node) ?? (node.type === "Literal" ? stringProperty(node, "value") : undefined);
};

/** How a call is spelt: eval for eval(), x.insertAdjacentHTML for any object's, document.write for document's. */
const calleeName = (callee: SyntaxNode | undefined): string | undefined => {
  if (callee?.type !== "MemberExpression") return identifierName(callee);
  const property = propertyName(childNode(callee, "property"));
  const object = identifierName(childNode(callee, "object"));
  return object === "document" ? `document.${property ?? ""}` : `x.${property ?? ""}`;
};

const isOneOf = (names: readonly string[], name: string | undefined): name is string => names.some((candidate) => candidate === name);

const templateText = (node: Rule.Node): string => {
  if (node.type !== "TemplateLiteral") return "";
  return node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join("");
};

const literalText = (node: Rule.Node): string | undefined => {
  if (node.type !== "Literal") return undefined;
  return typeof node.value === "string" ? node.value : undefined;
};

type Reporter = (node: Rule.Node, name: string) => void;

/** Listeners for the constructs that run or parse text: dangerouslySetInnerHTML, __html, innerHTML, eval, new Function. */
const sinkListeners = (context: Rule.RuleContext, reportSink: Reporter): Rule.RuleListener => {
  const isInsideJsx = (node: Rule.Node): boolean => context.sourceCode.getAncestors(node).some((ancestor) => ancestor.type.startsWith("JSX"));
  return {
    JSXAttribute(node: Rule.Node) {
      if (stringProperty(childNode(node, "name"), "name") !== "dangerouslySetInnerHTML") return;
      reportSink(node, "dangerouslySetInnerHTML");
    },
    Property(node: Rule.Node) {
      const isHtmlKeyOutsideJsx = propertyName(childNode(node, "key")) === "__html" && !isInsideJsx(node);
      if (!isHtmlKeyOutsideJsx) return;
      reportSink(node, "__html");
    },
    AssignmentExpression(node: Rule.Node) {
      const target = childNode(node, "left");
      const name = target?.type === "MemberExpression" ? propertyName(childNode(target, "property")) : undefined;
      if (!isOneOf(HTML_SINKS, name)) return;
      reportSink(node, name);
    },
    CallExpression(node: Rule.Node) {
      const name = calleeName(childNode(node, "callee"));
      if (!isOneOf(CODE_SINK_CALLS, name)) return;
      reportSink(node, name.replace(/^x\./, ""));
    },
    NewExpression(node: Rule.Node) {
      if (identifierName(childNode(node, "callee")) !== "Function") return;
      reportSink(node, "new Function");
    },
  };
};

/** The language a plain, untagged string's text reads as, or undefined when it reads as text. */
const codeLanguageOf = (node: Rule.Node, text: string | undefined): string | undefined => {
  if (text === undefined) return undefined;
  const isPlainString = !isTagged(node) && !isModuleSource(node);
  if (!isPlainString) return undefined;
  if (SCRIPT_PATTERN.test(text)) return "JavaScript";
  return MARKUP_PATTERN.test(text) ? "HTML" : undefined;
};

const implementation: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: DESCRIPTION },
    schema: [],
    messages: {
      sink: "{{name}} runs or parses text as code or HTML. Ship it as a file of its own language, or build the DOM through the framework. See rule no-embedded-code.",
      text: "This string reads as {{language}}. Move it into a .js, .html or .css file, or mark the language with a tagged template. See rule no-embedded-code.",
    },
  },
  create(context) {
    const reportSink: Reporter = (node, name) => {
      context.report(withPlaceholders({ node, messageId: "sink" }, { name }));
    };
    const reportText = (node: Rule.Node, text: string | undefined): void => {
      const language = codeLanguageOf(node, text);
      if (language === undefined) return;
      context.report(withPlaceholders({ node, messageId: "text" }, { language }));
    };
    return {
      ...sinkListeners(context, reportSink),
      Literal(node: Rule.Node) {
        reportText(node, literalText(node));
      },
      TemplateLiteral(node: Rule.Node) {
        reportText(node, templateText(node));
      },
    };
  },
};

export const noEmbeddedCodeRule = defineRule({
  id: "no-embedded-code",
  title: "Keep code and markup out of strings",
  description: DESCRIPTION,
  instead: "Move the script, markup or style into a file of its own language, or use a tagged template that names the language.",
  suppressWhen: "Prose or test data only looks like code, or a platform API takes code as a string and no file can be loaded instead.",
  enforcement: { type: "custom-oxlint", configuration: "error", implementation },
});
