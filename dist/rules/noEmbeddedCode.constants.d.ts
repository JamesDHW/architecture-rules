/** Text that reads as browser JavaScript: a function, a var, an arrow with a body, or the DOM and storage globals. */
export declare const SCRIPT_PATTERN: RegExp;
/** Text that reads as HTML: a tag with an attribute, or an element that is opened and closed. */
export declare const MARKUP_PATTERN: RegExp;
/** Properties that hand text to the browser to parse as HTML. */
export declare const HTML_SINKS: readonly ["innerHTML", "outerHTML"];
/** Calls that run or parse text as code or HTML, spelt as calleeName spells them. */
export declare const CODE_SINK_CALLS: readonly ["eval", "x.insertAdjacentHTML", "document.write", "document.writeln"];
/** Parents whose string child is a module specifier, not text. */
export declare const MODULE_SOURCE_PARENTS: ReadonlySet<string>;
//# sourceMappingURL=noEmbeddedCode.constants.d.ts.map