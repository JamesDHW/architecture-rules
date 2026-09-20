import type { Rule } from "eslint";
export declare const collectionLoopsRule: {
    readonly id: "collection-loops";
    readonly title: "Use for...of as the default loop form";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: {
            readonly meta: {
                readonly type: "suggestion";
                readonly docs: {
                    description: string;
                };
                readonly schema: [];
                readonly messages: {
                    readonly loop: "Use for...of, for await...of, or a dedicated collection operation. Other loop forms require an explicit scoped exception. See rule collection-loops.";
                };
            };
            readonly create: (context: Rule.RuleContext) => {
                "ForStatement, ForInStatement, WhileStatement, DoWhileStatement"(node: Rule.Node): void;
            };
        };
    };
};
export declare const noLoopJumpsRule: {
    readonly id: "no-loop-jumps";
    readonly title: "Replace loop jumps with selection or focused operations";
    readonly description: string;
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: {
            readonly meta: {
                readonly type: "suggestion";
                readonly docs: {
                    description: string;
                };
                readonly schema: [];
                readonly messages: {
                    readonly jump: "Use selection, a dedicated operation, or a focused helper return instead of break, continue, or labels. Preserve evaluation order; never introduce a mutable flag. See rule no-loop-jumps.";
                };
            };
            readonly create: (context: Rule.RuleContext) => {
                "BreakStatement, ContinueStatement, LabeledStatement"(node: Rule.Node): void;
            };
        };
    };
};
//# sourceMappingURL=loopControl.rules.d.ts.map