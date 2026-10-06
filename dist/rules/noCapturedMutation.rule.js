import path from "node:path";
import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Do not change an array, object, Map or Set from a function other than the one
that created it. State that must outlive a function call (a registry of live
connections, requests waiting for a reply) lives in a *.state.ts module, which
exports a factory of named operations. Building a value inside one function call
is not long-lived state and is outside this rule; no-array-mutation covers how to
build it.

Bad (a closure keeps changing it):
  const sockets: WebSocket[] = [];
  socket.addEventListener("open", () => sockets.push(socket));
Good (pendingRequests.state.ts):
  export const createPendingRequests = () => {
    const pending = new Map<string, PendingRequest>();
    return { add: (id, request) => { pending.set(id, request); }, ... };
  };

The check is syntactic: it follows containers created with [], {}, new Map, new
Set, new WeakMap or new WeakSet. It does not see mutation through function
parameters or objects returned by other calls.
`.trim();
const MUTATING_METHODS = new Set(["push", "pop", "shift", "unshift", "splice", "sort", "reverse", "fill", "copyWithin", "set", "delete", "clear", "add"]);
const CONTAINER_CONSTRUCTORS = new Set(["Map", "Set", "WeakMap", "WeakSet", "Array", "Object"]);
const unwrap = (node) => {
    const isWrapper = node?.type === "TSAsExpression" || node?.type === "TSSatisfiesExpression" || node?.type === "TSNonNullExpression" || node?.type === "ParenthesizedExpression";
    return isWrapper ? unwrap(node.expression) : node;
};
const isContainerCreation = (init) => {
    const value = unwrap(init);
    if (value === null || value === undefined)
        return false;
    if (value.type === "ArrayExpression" || value.type === "ObjectExpression")
        return true;
    if (value.type !== "NewExpression")
        return false;
    const callee = value.callee;
    return callee.type === "Identifier" && CONTAINER_CONSTRUCTORS.has(callee.name);
};
/** The identifier at the root of a.b.c, or undefined when the chain passes through a call. */
const rootIdentifier = (node) => {
    const value = unwrap(node);
    if (value?.type === "Identifier")
        return value;
    if (value?.type === "MemberExpression")
        return rootIdentifier(value.object);
    return undefined;
};
const enclosingFunctionScope = (scope) => scope.variableScope;
const implementation = {
    meta: {
        type: "suggestion",
        docs: { description: DESCRIPTION },
        schema: [],
        messages: {
            capturedMutation: "'{{name}}' was created outside this function. Keep long-lived state in a *.state.ts module, or build a new value instead. See rule no-captured-mutation.",
        },
    },
    create(context) {
        const filename = path.basename(context.filename.replaceAll("\\", "/"));
        if (/\.state\.[cm]?tsx?$/.test(filename))
            return {};
        const check = (target, at) => {
            const root = rootIdentifier(target);
            if (root === undefined)
                return;
            const scope = context.sourceCode.getScope(at);
            const reference = [...scope.references, ...scope.through].find((candidate) => candidate.identifier === root);
            const variable = reference?.resolved ?? findVariable(scope, root.name);
            const definition = variable?.defs[0];
            if (variable === null || variable === undefined || definition?.type !== "Variable")
                return;
            const declarator = definition.node;
            if (!isContainerCreation(declarator.init))
                return;
            if (enclosingFunctionScope(variable.scope) === enclosingFunctionScope(scope))
                return;
            context.report({ node: at, messageId: "capturedMutation", data: { name: variable.name } });
        };
        return {
            CallExpression(node) {
                const callee = node.callee;
                if (callee.type !== "MemberExpression" || callee.computed === true)
                    return;
                const property = callee.property;
                if (property.type !== "Identifier" || !MUTATING_METHODS.has(property.name))
                    return;
                check(callee.object, node);
            },
            AssignmentExpression(node) {
                const left = node.left;
                if (left.type === "MemberExpression")
                    check(left, node);
            },
            UpdateExpression(node) {
                const argument = node.argument;
                if (argument.type === "MemberExpression")
                    check(argument, node);
            },
            UnaryExpression(node) {
                const argument = node.argument;
                if (node.operator === "delete" && argument.type === "MemberExpression")
                    check(argument, node);
            },
        };
    },
};
const findVariable = (scope, name) => {
    if (scope === null)
        return undefined;
    return scope.set.get(name) ?? findVariable(scope.upper, name);
};
export const noCapturedMutationRule = defineRule({
    id: "no-captured-mutation",
    title: "Keep long-lived state in *.state.ts modules",
    description: DESCRIPTION,
    enforcement: { type: "custom-oxlint", configuration: "error", implementation },
});
//# sourceMappingURL=noCapturedMutation.rule.js.map