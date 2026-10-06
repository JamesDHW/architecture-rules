export const readonlyTypePropertiesCases = [
    {
        valid: [
            {
                name: "readonly properties and index signature",
                code: `
type Project = {
  readonly id: string;
  readonly members: readonly string[];
  readonly [key: string]: unknown;
};
`.trim(),
            },
            {
                name: "method signatures are not treated as data properties",
                code: `
type Clock = {
  now(): Date;
};
`.trim(),
            },
        ],
        invalid: [
            {
                name: "mutable property",
                code: `
type Project = {
  id: string;
};
`.trim(),
                errors: [{ messageId: "readonlyProperty" }],
            },
            {
                name: "mutable index signature",
                code: `
type Bag = {
  [key: string]: string;
};
`.trim(),
                errors: [{ messageId: "readonlyProperty" }],
            },
        ],
    },
];
//# sourceMappingURL=readonlyTypeProperties.cases.js.map