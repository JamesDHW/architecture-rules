import { defineRule } from "../core/defineRule.js";
import { isPresent } from "../core/guards.js";
import { getSoleStatement } from "./branchStatement.js";
const DESCRIPTION = `
When the remaining path of a function or block is only "if condition return
true; return false" or the reverse, return the condition instead.

Early returns that exit with true or false remain allowed when later paths
return something other than the opposite literal. Those are exception-first
decisions, not a boolean wrapped in a detour.
`.trim();
const getReturnedBoolean = (statement) => {
    if (statement.type !== "ReturnStatement")
        return undefined;
    const value = statement.argument?.type === "Literal" ? statement.argument.value : undefined;
    return typeof value === "boolean" ? value : undefined;
};
const getSoleReturnedBoolean = (branch) => {
    const sole = getSoleStatement(branch);
    return sole === undefined ? undefined : getReturnedBoolean(sole);
};
const reportOppositeBooleanReturns = (context, node, thenValue, elseValue) => {
    const areOpposite = thenValue !== undefined && elseValue !== undefined && thenValue !== elseValue;
    if (!areOpposite)
        return;
    context.report({ node, messageId: "booleanTail" });
};
const checkStatements = (context, statements) => {
    for (const [index, statement] of statements.entries()) {
        const next = statements[index + 1];
        const isGuardBeforeNext = statement.type === "IfStatement" && !isPresent(statement.alternate) && next !== undefined;
        if (isGuardBeforeNext) {
            reportOppositeBooleanReturns(context, statement, getSoleReturnedBoolean(statement.consequent), getReturnedBoolean(next));
        }
    }
};
const implementation = {
    meta: {
        type: "suggestion",
        docs: {
            description: DESCRIPTION,
        },
        messages: {
            booleanTail: "Return the boolean expression (negated for the reverse case). For non-boolean inputs, first express the intended comparison explicitly. See rule prefer-single-boolean-return.",
        },
    },
    create(context) {
        return {
            IfStatement(node) {
                const { alternate } = node;
                const isFinalElse = isPresent(alternate) && alternate.type !== "IfStatement";
                if (!isFinalElse)
                    return;
                reportOppositeBooleanReturns(context, node, getSoleReturnedBoolean(node.consequent), getSoleReturnedBoolean(alternate));
            },
            SwitchCase(node) {
                checkStatements(context, node.consequent);
            },
            Program(node) {
                checkStatements(context, node.body);
            },
            BlockStatement(node) {
                checkStatements(context, node.body);
            },
        };
    },
};
export const preferSingleBooleanReturnRule = defineRule({
    id: "prefer-single-boolean-return",
    title: "Return a boolean expression instead of a true/false tail",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=preferSingleBooleanReturn.rule.js.map