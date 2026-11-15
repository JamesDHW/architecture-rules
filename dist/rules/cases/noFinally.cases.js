export const noFinallyCases = [
    {
        valid: ["try { loadProject(); } catch (caught) { reportFailure(caught); }"],
        invalid: [
            {
                code: "try { loadProject(); } finally { closeSession(); }",
                errors: [{ messageId: "finally" }],
            },
        ],
    },
];
//# sourceMappingURL=noFinally.cases.js.map