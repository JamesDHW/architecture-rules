export const noRawExceptionsCases = [
    {
        valid: ["const result = await tryCatch(() => loadProject());"],
        invalid: [
            "throw new ProjectError();",
            "try { loadProject(); } catch (caught) { reportFailure(caught); }",
        ].map((code) => ({ code, errors: [{ messageId: "raw" }] })),
    },
];
//# sourceMappingURL=noRawExceptions.cases.js.map