import type { Rule } from "eslint";

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

type AnyNode = { readonly type: string; readonly [key: string]: unknown };

const isPascalCase = (name: string): boolean => /^[A-Z]/.test(name);
const isFunction = (node: AnyNode | undefined): boolean => node?.type === "ArrowFunctionExpression" || node?.type === "FunctionExpression" || node?.type === "FunctionDeclaration";
const isJsx = (node: AnyNode | null | undefined): boolean => node?.type === "JSXElement" || node?.type === "JSXFragment";

const returnsJsx = (node: AnyNode | null | undefined): boolean => {
  if (node === null || node === undefined || typeof node !== "object") return false;
  if (isJsx(node)) return true;
  if (node.type === "ReturnStatement") return containsJsx(node.argument as AnyNode);
  if (isFunction(node)) return false;
  return Object.entries(node).some(([key, value]) => key !== "parent" && (Array.isArray(value) ? value.some((child) => returnsJsx(child as AnyNode)) : returnsJsx(value as AnyNode)));
};
const containsJsx = (node: AnyNode | null | undefined): boolean => {
  if (node === null || node === undefined || typeof node !== "object") return false;
  if (isJsx(node)) return true;
  if (isFunction(node)) return false;
  return Object.entries(node).some(([key, value]) => key !== "parent" && (Array.isArray(value) ? value.some((child) => containsJsx(child as AnyNode)) : containsJsx(value as AnyNode)));
};
const isComponentFunction = (fn: AnyNode): boolean => {
  const body = fn.body as AnyNode;
  return body.type === "BlockStatement" ? returnsJsx(body) : containsJsx(body);
};

const COMPONENT_TYPES = new Set(["FC", "FunctionComponent", "VFC"]);

/** True when an annotation names FC, FunctionComponent or VFC, including React.FC. */
const isComponentType = (node: unknown): boolean => {
  if (node === null || typeof node !== "object") return false;
  const value = node as AnyNode;
  if (value.type === "Identifier" && COMPONENT_TYPES.has(value.name as string)) return true;
  return Object.entries(value).some(([key, child]) => key !== "parent" && (Array.isArray(child) ? child.some(isComponentType) : isComponentType(child)));
};

/** memo(fn) and forwardRef(fn) wrap a component function. */
const componentFunction = (init: AnyNode | undefined): AnyNode | undefined => {
  if (isFunction(init)) return init;
  if (init?.type !== "CallExpression") return undefined;
  const callee = init.callee as AnyNode;
  const name = callee.type === "Identifier" ? callee.name : callee.type === "MemberExpression" ? (callee.property as AnyNode).name : undefined;
  if (name !== "memo" && name !== "forwardRef") return undefined;
  const [first] = init.arguments as AnyNode[];
  return isFunction(first) ? first : undefined;
};

const implementation: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: DESCRIPTION },
    schema: [],
    messages: {
      destructuredProps: "Destructure {{name}}'s props in its parameter list. See rule destructured-props.",
    },
  },
  create(context) {
    const check = (name: string, fn: AnyNode, isTyped: boolean, at: Rule.Node): void => {
      if (!isPascalCase(name)) return;
      const [first] = fn.params as AnyNode[];
      const parameter = first?.type === "AssignmentPattern" ? (first.left as AnyNode) : first;
      if (parameter?.type !== "Identifier") return;
      if (!isTyped && !isComponentFunction(fn)) return;
      context.report({ node: at, messageId: "destructuredProps", data: { name } });
    };
    return {
      VariableDeclarator(node) {
        const id = node.id as unknown as AnyNode;
        if (id.type !== "Identifier") return;
        const fn = componentFunction(node.init as unknown as AnyNode | undefined);
        if (fn === undefined) return;
        check(id.name as string, fn, isComponentType(id.typeAnnotation), node);
      },
      FunctionDeclaration(node) {
        const fn = node as unknown as AnyNode;
        const id = fn.id as AnyNode | null;
        if (id === null) return;
        check(id.name as string, fn, false, node);
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
