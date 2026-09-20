export const defineRule = (rule) => {
    return rule;
};
export const defineRuleOptions = (schema, validate) => ({ schema, ...(validate === undefined ? {} : { validate }) });
//# sourceMappingURL=defineRule.js.map