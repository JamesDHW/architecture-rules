/** A fenced code block. */
export const fence = (code, lang = "") => `\`\`\`${lang}\n${code.trimEnd()}\n\`\`\``;
/** Inline code that survives backticks in its content. */
export const inlineCode = (text) => (text.includes("`") ? `\`\` ${text} \`\`` : `\`${text}\``);
/** Escapes characters that would break a Markdown table cell. */
export const tableCell = (text) => text.replaceAll("|", "\\|").replaceAll("\n", " ");
const isExampleLine = (line) => /^(?:Good|Bad)\b/.test(line.trimStart());
const proseMarkdown = (lines) => lines.map((line) => line.trim()).join(" ");
/** One description paragraph: prose, then any Good:/Bad: example lines as a code block. */
const paragraphMarkdown = (paragraph) => {
    const lines = paragraph.split("\n");
    const firstExample = lines.findIndex(isExampleLine);
    if (firstExample === -1)
        return proseMarkdown(lines);
    const prose = proseMarkdown(lines.slice(0, firstExample));
    const examples = fence(lines.slice(firstExample).join("\n"));
    return prose.length > 0 ? `${prose}\n\n${examples}` : examples;
};
/** A rule description as Markdown paragraphs. */
export const descriptionMarkdown = (description) => description.split(/\n\s*\n/).map(paragraphMarkdown).join("\n\n");
//# sourceMappingURL=markdown.js.map