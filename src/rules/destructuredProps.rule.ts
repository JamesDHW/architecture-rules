import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";
import { COMPONENT_TYPES } from "./destructuredProps.constants.js";
import { identifierName, childNode, childNodes, directChildren, stringProperty, type SyntaxNode } from "./syntaxNode.js";
import { withPlaceholders } from "./messagePlaceholders.js";

const DESCRIPTION = `
Destructure a React component's props in its parameter list. The parameter list
then shows every prop the component uses, and the body reads names rather than
props.name.

Good: export const RunList: FC<RunListProps> = ({ runs, emptyText }) => { ... };
Bad:  export const RunList: FC<RunListProps> = (props) => { ... props.runs ... };

A component is a PascalCase binding to a function that is typed as FC or
FunctionComponent, or that returns JSX.
`.trim();

const isPascalCase = (name: string): boolean => /^[A-Z]/.test(name);
const isFunction = (node: SyntaxNode | undefined): boolean => node?.type === "ArrowFunctionExpression" || node?.type === "FunctionExpression" || node?.type === "FunctionDeclaration";
const isJsx = (node: SyntaxNode): boolean => node.type === "JSXElement" || node.type === "JSXFragment";
const isComponentWrapperName = (name: string | undefined): boolean => name === "memo" || name === "forwardRef";


/** True when node contains JSX outside any nested function. */
const containsJsx = (node: SyntaxNode | undefined): boolean => {
  if (node === undefined) return false;
  if (isJsx(node)) return true;
  if (isFunction(node)) return false;
  return directChildren(node).some(containsJsx);
};

/** True when node contains JSX, or a return of JSX, outside any nested function. */
const returnsJsx = (node: SyntaxNode): boolean => {
  if (isJsx(node)) return true;
  if (node.type === "ReturnStatement") return containsJsx(childNode(node, "argument"));
  if (isFunction(node)) return false;
  return directChildren(node).some(returnsJsx);
};

const isComponentFunction = (fn: object): boolean => {
  const body = childNode(fn, "body");
  return body?.type === "BlockStatement" ? returnsJsx(body) : containsJsx(body);
};

/** The first parameter is a plain name, possibly with a default: (props) or (props = defaults). */
const hasNamedPropsParameter = (fn: object): boolean => {
  const [first] = childNodes(fn, "params");
  const parameter = first?.type === "AssignmentPattern" ? childNode(first, "left") : first;
  return parameter?.type === "Identifier";
};

const isComponentTypeName = (node: SyntaxNode): boolean => {
  const name = identifierName(node);
  return name !== undefined && COMPONENT_TYPES.has(name);
};

/** True when an annotation names FC, FunctionComponent or VFC, including React.FC. */
const isComponentType = (node: SyntaxNode | undefined): boolean => {
  if (node === undefined) return false;
  return isComponentTypeName(node) || directChildren(node).some(isComponentType);
};

/** The name a call such as memo(fn) or React.memo(fn) invokes. */
const calleeName = (callee: SyntaxNode | undefined): string | undefined => {
  return callee?.type === "MemberExpression" ? stringProperty(childNode(callee, "property"), "name") : identifierName(callee);
};

const isComponentWrapperCall = (node: SyntaxNode | undefined): boolean => {
  return node?.type === "CallExpression" && isComponentWrapperName(calleeName(childNode(node, "callee")));
};

/** memo(fn) and forwardRef(fn) wrap a component function. */
const componentFunction = (init: SyntaxNode | undefined): SyntaxNode | undefined => {
  if (isFunction(init)) return init;
  if (!isComponentWrapperCall(init)) return undefined;
  const [first] = childNodes(init, "arguments");
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
    const check = (name: string, fn: object, isTyped: boolean, at: Rule.Node): void => {
      const hasUndestructuredProps = isPascalCase(name) && hasNamedPropsParameter(fn) && (isTyped || isComponentFunction(fn));
      if (hasUndestructuredProps) {
        context.report(withPlaceholders({ node: at, messageId: "destructuredProps" }, { name }));
      }
    };
    return {
      VariableDeclarator(node) {
        if (node.id.type !== "Identifier") return;
        const fn = componentFunction(childNode(node, "init"));
        if (fn === undefined) return;
        check(node.id.name, fn, isComponentType(childNode(node.id, "typeAnnotation")), node);
      },
      FunctionDeclaration(node) {
        const name = identifierName(childNode(node, "id"));
        if (name === undefined) return;
        check(name, node, false, node);
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
