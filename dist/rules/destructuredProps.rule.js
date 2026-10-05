import { defineRule } from "../core/defineRule.js";
const DESCRIPTION = `
Destructure a React component's props in its parameter list. The parameter list
then shows every prop the component uses, and the body reads names rather than
props.name.

Good: export const RunList: FC<RunListProps> = ({ runs, emptyText }) => { ... };
Bad:  export const RunList: FC<RunListProps> = (props) => { ... props.runs ... };

A component is a PascalCase binding to a function that is typed as FC or
FunctionComponent, or that returns JSX.
`.trim();
const isPascalCase = (name) => /^[A-Z]/.test(name);
const isFunction = (node) => node?.type === "ArrowFunctionExpression" || node?.type === "FunctionExpression" || node?.type === "FunctionDeclaration";
const isJsx = (node) => node?.type === "JSXElement" || node?.type === "JSXFragment";
const returnsJsx = (node) => {
    if (node === null || node === undefined || typeof node !== "object")
        return false;
    if (isJsx(node))
        return true;
    if (node.type === "ReturnStatement")
        return containsJsx(node.argument);
    if (isFunction(node))
        return false;
    return Object.entries(node).some(([key, value]) => key !== "parent" && (Array.isArray(value) ? value.some((child) => returnsJsx(child)) : returnsJsx(value)));
};
const containsJsx = (node) => {
    if (node === null || node === undefined || typeof node !== "object")
        return false;
    if (isJsx(node))
        return true;
    if (isFunction(node))
        return false;
    return Object.entries(node).some(([key, value]) => key !== "parent" && (Array.isArray(value) ? value.some((child) => containsJsx(child)) : containsJsx(value)));
};
const isComponentFunction = (fn) => {
    const body = fn.body;
    return body.type === "BlockStatement" ? returnsJsx(body) : containsJsx(body);
};
const COMPONENT_TYPES = new Set(["FC", "FunctionComponent", "VFC"]);
/** True when an annotation names FC, FunctionComponent or VFC, including React.FC. */
const isComponentType = (node) => {
    if (node === null || typeof node !== "object")
        return false;
    const value = node;
    if (value.type === "Identifier" && COMPONENT_TYPES.has(value.name))
        return true;
    return Object.entries(value).some(([key, child]) => key !== "parent" && (Array.isArray(child) ? child.some(isComponentType) : isComponentType(child)));
};
/** memo(fn) and forwardRef(fn) wrap a component function. */
const componentFunction = (init) => {
    if (isFunction(init))
        return init;
    if (init?.type !== "CallExpression")
        return undefined;
    const callee = init.callee;
    const name = callee.type === "Identifier" ? callee.name : callee.type === "MemberExpression" ? callee.property.name : undefined;
    if (name !== "memo" && name !== "forwardRef")
        return undefined;
    const [first] = init.arguments;
    return isFunction(first) ? first : undefined;
};
const implementation = {
    meta: {
        type: "suggestion",
        docs: { description: DESCRIPTION },
        schema: [],
        messages: {
            destructuredProps: "Destructure {{name}}'s props in its parameter list. See rule destructured-props.",
        },
    },
    create(context) {
        const check = (name, fn, isTyped, at) => {
            if (!isPascalCase(name))
                return;
            const [first] = fn.params;
            const parameter = first?.type === "AssignmentPattern" ? first.left : first;
            if (parameter?.type !== "Identifier")
                return;
            if (!isTyped && !isComponentFunction(fn))
                return;
            context.report({ node: at, messageId: "destructuredProps", data: { name } });
        };
        return {
            VariableDeclarator(node) {
                const id = node.id;
                if (id.type !== "Identifier")
                    return;
                const fn = componentFunction(node.init);
                if (fn === undefined)
                    return;
                check(id.name, fn, isComponentType(id.typeAnnotation), node);
            },
            FunctionDeclaration(node) {
                const fn = node;
                const id = fn.id;
                if (id === null)
                    return;
                check(id.name, fn, false, node);
            },
        };
    },
};
export const destructuredPropsRule = defineRule({
    id: "destructured-props",
    title: "Destructure component props in the parameter list",
    description: DESCRIPTION,
    enforcement: { type: "custom-oxlint", configuration: "error", implementation },
});
//# sourceMappingURL=destructuredProps.rule.js.map