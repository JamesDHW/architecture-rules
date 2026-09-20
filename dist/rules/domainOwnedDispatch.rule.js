import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
When a reducer delegates behavior to domain reducers, represent those domains
explicitly in the action type. The parent dispatches exhaustively by domain;
each child dispatches exhaustively over its own action union. A single-domain
reducer may retain a flat action union. Events affecting multiple domains need
an explicit coordinating owner, not an arbitrary split by action-name prefix.

Good: switch (event.domain) {
  case "admin": return reduceAdmin(state, event.action);
  case "create": return reduceCreate(state, event.action);
  default: return event satisfies never;
}
Bad: switch (action.type) {
  case "adminPanel":
  case "adminForm": return reduceAdmin(state, action);
}
Also bad: trying child reducers until one returns a non-null handled result.
Adding a child action should not require editing its parent's routing labels.

Native switch-exhaustiveness enforcement remains responsible for union coverage.
This custom syntax check recognizes functions named reduce or reduce followed
by an uppercase letter, with identifier state/action parameters. In a switch
on the second parameter's .type, it rejects multiple explicit labels returning
the same reduceX(firstParameter, secondParameter) call, grouped or separate.
Case bodies must contain only that return, optionally enclosed in bare blocks.
It does not infer domain ownership, resolve reducer aliases, inspect transformed
arguments or effectful case bodies, or detect nullable handled-result protocols.
Those remain agent/review obligations. Ordinary shared behavior cases and
single-domain flat reducers are not prohibited merely because they are long.
No automatic fix can safely invent domain boundaries or migrate action producers.
`.trim();
const isReducerName = (name) => /^reduce(?:$|[A-Z])/.test(name);
const getReducerParameters = (node) => {
    let parent = node.parent;
    while (parent !== undefined && parent !== null) {
        if (parent.type === "FunctionDeclaration" || parent.type === "FunctionExpression" || parent.type === "ArrowFunctionExpression") {
            const name = parent.type === "FunctionDeclaration" ? parent.id?.name
                : parent.parent?.type === "VariableDeclarator" && parent.parent.id.type === "Identifier"
                    ? parent.parent.id.name : undefined;
            if (name === undefined || !isReducerName(name))
                return undefined;
            const [state, action] = parent.params;
            if (state?.type !== "Identifier" || action?.type !== "Identifier")
                return undefined;
            return [state.name, action.name];
        }
        parent = parent.parent;
    }
    return undefined;
};
const getReturnedReducer = (statements, state, action) => {
    if (statements.length !== 1)
        return undefined;
    const statement = statements[0];
    if (statement?.type === "BlockStatement")
        return getReturnedReducer(statement.body, state, action);
    if (statement?.type !== "ReturnStatement" || statement.argument?.type !== "CallExpression")
        return undefined;
    const call = statement.argument;
    if (call.optional || call.callee.type !== "Identifier" || !/^reduce[A-Z]/.test(call.callee.name))
        return undefined;
    if (call.arguments.length !== 2)
        return undefined;
    const [stateArgument, actionArgument] = call.arguments;
    if (stateArgument?.type !== "Identifier" || stateArgument.name !== state)
        return undefined;
    if (actionArgument?.type !== "Identifier" || actionArgument.name !== action)
        return undefined;
    return call.callee.name;
};
const implementation = {
    meta: {
        type: "suggestion",
        docs: { description: DESCRIPTION },
        schema: [],
        messages: {
            domainRouting: "Do not enumerate child actions to route to {{reducer}}. Dispatch by an explicit domain and let the child own its action union. See rule domain-owned-dispatch.",
        },
    },
    create(context) {
        return {
            SwitchStatement(node) {
                const parameters = getReducerParameters(node);
                if (parameters === undefined)
                    return;
                const [state, action] = parameters;
                const discriminant = node.discriminant;
                if (discriminant.type !== "MemberExpression" || discriminant.computed || discriminant.optional)
                    return;
                if (discriminant.object.type !== "Identifier" || discriminant.object.name !== action)
                    return;
                if (discriminant.property.type !== "Identifier" || discriminant.property.name !== "type")
                    return;
                const labelsByReducer = new Map();
                let pendingLabels = [];
                for (const branch of node.cases) {
                    if (branch.test !== null)
                        pendingLabels.push(branch);
                    if (branch.consequent.length === 0)
                        continue;
                    const reducer = getReturnedReducer(branch.consequent, state, action);
                    if (reducer !== undefined) {
                        const labels = labelsByReducer.get(reducer) ?? [];
                        labels.push(...pendingLabels);
                        labelsByReducer.set(reducer, labels);
                    }
                    pendingLabels = [];
                }
                for (const [reducer, labels] of labelsByReducer) {
                    const firstLabel = labels[0];
                    if (labels.length < 2 || firstLabel === undefined)
                        continue;
                    context.report({ node: firstLabel, messageId: "domainRouting", data: { reducer } });
                }
            },
        };
    },
};
export const domainOwnedDispatchRule = defineRule({
    id: "domain-owned-dispatch",
    title: "Dispatch domain actions through their owning reducer",
    description: DESCRIPTION,
    enforcement: { type: "custom-oxlint", configuration: "error", implementation },
});
//# sourceMappingURL=domainOwnedDispatch.rule.js.map