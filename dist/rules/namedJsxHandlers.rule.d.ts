import type { Rule } from "eslint";
export declare const namedJsxHandlersRule: {
    readonly id: "named-jsx-handlers";
    readonly title: "Name every non-pass-through React handler";
    readonly description: string;
    readonly instead: "Pass a named handler, or bind one with plain values: onClick={handleRemoveClick(row.id)}.";
    readonly evasions: readonly [{
        readonly name: "Passing a row's id through the DOM";
        readonly lang: "tsx";
        readonly code: "const handleRemoveClick = (event: MouseEvent<HTMLButtonElement>) => removeConnection(event.currentTarget.value);\nconst Row = ({ connection }: RowProps) => <button value={connection.id} onClick={handleRemoveClick}>Remove</button>;";
        readonly why: "A typed id becomes a string read back from the DOM. Bind the handler with the value instead: onClick={handleRemoveClick(connection.id)}.";
    }];
    readonly enforcement: {
        readonly type: "custom-oxlint";
        readonly configuration: "error";
        readonly implementation: Rule.RuleModule;
    };
};
//# sourceMappingURL=namedJsxHandlers.rule.d.ts.map