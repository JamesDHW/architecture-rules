/** An expected finding by message id, with the values of its {{name}} placeholders. */
export const expectedFinding = (messageId, placeholders) => {
    // architecture-disable-next-line generic-name-denylist -- RuleTester matches message placeholders through a field named data.
    return { messageId, data: placeholders };
};
//# sourceMappingURL=ruleCases.js.map