import type { Rule } from "eslint";
/** Values for a report message's {{name}} placeholders, keyed by placeholder name. */
export type MessagePlaceholders = Readonly<Record<string, string>>;
/**
 * A report descriptor that fills its message placeholders. ESLint reads them
 * from a field named data, a name generic-name-denylist rejects everywhere
 * else, so this is the one place that spells it.
 */
export declare const withPlaceholders: (descriptor: Rule.ReportDescriptor, placeholders: MessagePlaceholders) => Rule.ReportDescriptor;
//# sourceMappingURL=messagePlaceholders.d.ts.map