/** How much of a name glossary-aliases reads: its head noun, the default, or every word. */
type AliasOptions = {
    readonly match?: "head" | "any";
};
export declare const glossaryAliasesRule: {
    readonly id: "glossary-aliases";
    readonly title: "Name things with the glossary's words";
    readonly description: string;
    readonly instead: "Rename to the glossary's term: client becomes customer.";
    readonly suppressWhen: "The name is fixed by something outside the layer, such as a wire format, and cannot be renamed.";
    readonly options: import("../core/defineRule.js").RuleOptions<[AliasOptions?]>;
    readonly enforcement: {
        readonly type: "glossary";
        readonly configuration: "error";
    };
};
export declare const glossaryTypesRule: {
    readonly id: "glossary-types";
    readonly title: "Give each glossary term one type";
    readonly description: string;
    readonly instead: "Give the value the term's type, or rename it to say what it is: customerId, customerName.";
    readonly suppressWhen: "The value really is the concept but has to be typed loosely, such as raw input before it is parsed.";
    readonly enforcement: {
        readonly type: "glossary";
        readonly configuration: "error";
    };
};
export declare const unusedTermsRule: {
    readonly id: "unused-terms";
    readonly title: "Define only the terms the code uses";
    readonly description: string;
    readonly instead: "Remove the term, or the glossary, from architecture.config.ts; or name the code after it.";
    readonly enforcement: {
        readonly type: "configuration";
        readonly configuration: "error";
    };
};
export {};
//# sourceMappingURL=glossary.rules.d.ts.map