import type { Rule } from "eslint";

/** Values for a report message's {{name}} placeholders, keyed by placeholder name. */
export type MessagePlaceholders = Readonly<Record<string, string>>;

/**
 * A report descriptor that fills its message placeholders. ESLint reads them
 * from a field named data, a name generic-name-denylist rejects everywhere
 * else, so this is the one place that spells it.
 */
export const withPlaceholders = (
  descriptor: Rule.ReportDescriptor,
  placeholders: MessagePlaceholders,
): Rule.ReportDescriptor => {
  // oxlint-disable-next-line eslint/id-denylist -- ESLint's report descriptor API requires the placeholder field to be named data.
  return { ...descriptor, data: placeholders };
};
