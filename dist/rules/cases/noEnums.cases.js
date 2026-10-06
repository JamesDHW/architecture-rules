export const noEnumsCases = [
    {
        valid: [
            {
                name: "literal union",
                code: 'type ProjectStatus = "draft" | "active" | "archived";\n',
            },
        ],
        invalid: [
            {
                name: "enum declaration",
                code: "enum ProjectStatus { Draft, Active }\n",
                errors: [{ messageId: "noEnums" }],
            },
        ],
    },
];
//# sourceMappingURL=noEnums.cases.js.map