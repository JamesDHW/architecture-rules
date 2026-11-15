/** A fenced code block. */
export declare const fence: (code: string, lang?: string) => string;
/** Inline code that survives backticks in its content. */
export declare const inlineCode: (text: string) => string;
/** Escapes characters that would break a Markdown table cell. */
export declare const tableCell: (text: string) => string;
/** A rule description as Markdown paragraphs. */
export declare const descriptionMarkdown: (description: string) => string;
//# sourceMappingURL=markdown.d.ts.map