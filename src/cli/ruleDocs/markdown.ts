/** A fenced code block. */
export const fence = (code: string, lang = ""): string => `\`\`\`${lang}\n${code.trimEnd()}\n\`\`\``;

/** Inline code that survives backticks in its content. */
export const inlineCode = (text: string): string => (text.includes("`") ? `\`\` ${text} \`\`` : `\`${text}\``);

/** Escapes characters that would break a Markdown table cell. */
export const tableCell = (text: string): string => text.replaceAll("|", "\\|").replaceAll("\n", " ");

const isExampleLine = (line: string): boolean => /^(?:Good|Bad)\b/.test(line.trimStart());

const proseMarkdown = (lines: readonly string[]): string => lines.map((line) => line.trim()).join(" ");

/** One description paragraph: prose, then any Good:/Bad: example lines as a code block. */
const paragraphMarkdown = (paragraph: string): string => {
  const lines = paragraph.split("\n");
  const firstExample = lines.findIndex(isExampleLine);
  if (firstExample === -1) return proseMarkdown(lines);
  const prose = proseMarkdown(lines.slice(0, firstExample));
  const examples = fence(lines.slice(firstExample).join("\n"));
  return prose.length > 0 ? `${prose}\n\n${examples}` : examples;
};

/** A rule description as Markdown paragraphs. */
export const descriptionMarkdown = (description: string): string => description.split(/\n\s*\n/).map(paragraphMarkdown).join("\n\n");
