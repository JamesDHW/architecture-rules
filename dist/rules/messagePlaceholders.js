/**
 * A report descriptor that fills its message placeholders. ESLint reads them
 * from a field named data, a name generic-name-denylist rejects everywhere
 * else, so this is the one place that spells it.
 */
export const withPlaceholders = (descriptor, placeholders) => {
    // oxlint-disable-next-line eslint/id-denylist -- ESLint's report descriptor API requires the placeholder field to be named data.
    return { ...descriptor, data: placeholders };
};
//# sourceMappingURL=messagePlaceholders.js.map