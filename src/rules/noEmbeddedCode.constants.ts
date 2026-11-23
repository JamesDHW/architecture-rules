/** Text that reads as browser JavaScript: a function, a var, an arrow with a body, or the DOM and storage globals. */
export const SCRIPT_PATTERN = /\bfunction\s*[\w$]*\s*\(|=>\s*\{|\bvar\s+[\w$]+\s*=|\baddEventListener\s*\(|\b(?:document|window|localStorage|sessionStorage)\.[a-zA-Z]/;

/** Text that reads as HTML: a tag with an attribute, or an element that is opened and closed. */
export const MARKUP_PATTERN = /<[a-zA-Z][\w-]*\s+[\w:-]+\s*=\s*["']|<([a-zA-Z][\w-]*)\b[^<>]*>[\s\S]*<\/\1\s*>/;

/** Properties that hand text to the browser to parse as HTML. */
export const HTML_SINKS = ["innerHTML", "outerHTML"] as const;

/** Calls that run or parse text as code or HTML, spelt as calleeName spells them. */
export const CODE_SINK_CALLS = ["eval", "x.insertAdjacentHTML", "document.write", "document.writeln"] as const;

/** Parents whose string child is a module specifier, not text. */
export const MODULE_SOURCE_PARENTS: ReadonlySet<string> = new Set(["ImportDeclaration", "ExportNamedDeclaration", "ExportAllDeclaration", "ImportExpression"]);
