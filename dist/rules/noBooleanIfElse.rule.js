import { defineRule } from "../core/defineRule.js";
import { isPresent } from "../core/guards.js";
import { getSoleStatement } from "./branchStatement.js";
const DESCRIPTION = `
Do not use intermediary branches to pass true and false into the same call.
Pass the boolean expression directly.

Stopping the flow instead of accumulating flag assignments prevents unwanted
behaviour during a change.
`.trim();
const getSoleCall = (branch) => {
    const sole = getSoleStatement(branch);
    if (sole?.type !== "ExpressionStatement")
        return undefined;
    return sole.expression.type === "CallExpression" ? sole.expression : undefined;
};
/** A branch whose only statement calls a function with a single true or false literal. */
const getBooleanCall = (branch, sourceCode) => {
    const call = getSoleCall(branch);
    if (call?.arguments.length !== 1)
        return undefined;
    const [argument] = call.arguments;
    const value = argument?.type === "Literal" ? argument.value : undefined;
    return typeof value === "boolean" ? { calleeText: sourceCode.getText(call.callee), value } : undefined;
};
const passOppositeBooleansToSameCallee = (thenCall, elseCall) => {
    return thenCall !== undefined && elseCall !== undefined && thenCall.value !== elseCall.value &&
        thenCall.calleeText === elseCall.calleeText;
};
const implementation = {
    meta: {
        type: "suggestion",
        docs: {
            description: DESCRIPTION,
        },
        messages: {
            booleanIfElse: "Pass the boolean expression into the call directly instead of branching on true and false. See rule no-boolean-if-else.",
        },
    },
    create(context) {
        return {
            IfStatement(node) {
                if (!isPresent(node.alternate))
                    return;
                const thenCall = getBooleanCall(node.consequent, context.sourceCode);
                const elseCall = getBooleanCall(node.alternate, context.sourceCode);
                if (!passOppositeBooleansToSameCallee(thenCall, elseCall))
                    return;
                context.report({ node, messageId: "booleanIfElse" });
            },
        };
    },
};
export const noBooleanIfElseRule = defineRule({
    id: "no-boolean-if-else",
    title: "Pass booleans directly instead of branching",
    description: DESCRIPTION,
    enforcement: {
        type: "custom-oxlint",
        configuration: "error",
        implementation,
    },
});
//# sourceMappingURL=noBooleanIfElse.rule.js.map