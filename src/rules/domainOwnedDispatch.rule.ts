import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";
import { isPresent } from "../core/guards.js";
import { identifierName, childNode, childNodes, stringProperty, type SyntaxNode } from "./syntaxNode.js";
import { withPlaceholders } from "./messagePlaceholders.js";

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

type SwitchNode = Parameters<NonNullable<Rule.RuleListener["SwitchStatement"]>>[0];
type SwitchCase = SwitchNode["cases"][number];
type Statement = SwitchCase["consequent"][number];
type ReturnedExpression = NonNullable<Extract<Statement, { readonly type: "ReturnStatement" }>["argument"]>;
type CallNode = Extract<ReturnedExpression, { readonly type: "CallExpression" }>;
type RoutedCase = { readonly reducer: string | undefined; readonly labels: readonly SwitchCase[] };

const isReducerName = (name: string | undefined): boolean => name !== undefined && /^reduce(?:$|[A-Z])/.test(name);
const isChildReducerName = (name: string | undefined): boolean => name !== undefined && /^reduce[A-Z]/.test(name);

const isFunctionNode = (node: SyntaxNode): boolean => {
  return node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression";
};


const isIdentifierNamed = (node: unknown, name: string): boolean => identifierName(node) === name;

/** The nearest function enclosing node, or node itself when it is one. */
const enclosingFunction = (node: SyntaxNode | undefined): SyntaxNode | undefined => {
  if (node === undefined) return undefined;
  return isFunctionNode(node) ? node : enclosingFunction(childNode(node, "parent"));
};

/** A function declaration's own name, or the identifier a function expression is bound to. */
const functionName = (fn: SyntaxNode | undefined): string | undefined => {
  if (fn?.type === "FunctionDeclaration") return stringProperty(childNode(fn, "id"), "name");
  const declarator = childNode(fn, "parent");
  return declarator?.type === "VariableDeclarator" ? identifierName(childNode(declarator, "id")) : undefined;
};

const getReducerParameters = (node: SwitchNode): readonly [string, string] | undefined => {
  const reducer = enclosingFunction(childNode(node, "parent"));
  if (!isReducerName(functionName(reducer))) return undefined;
  const [state, action] = childNodes(reducer, "params").map(identifierName);
  const hasIdentifierParameters = state !== undefined && action !== undefined;
  return hasIdentifierParameters ? [state, action] : undefined;
};

/** action.type, read directly from the reducer's action parameter. */
const isActionTypeRead = (discriminant: SwitchNode["discriminant"], action: string): boolean => {
  if (discriminant.type !== "MemberExpression") return false;
  return !discriminant.computed && !discriminant.optional && isIdentifierNamed(discriminant.object, action) && isIdentifierNamed(discriminant.property, "type");
};

const returnedCall = (statement: Statement | undefined): CallNode | undefined => {
  if (statement?.type !== "ReturnStatement") return undefined;
  return statement.argument?.type === "CallExpression" ? statement.argument : undefined;
};

/** reduceX(state, action): a child reducer receiving both parameters unchanged. */
const forwardedReducer = (call: CallNode, state: string, action: string): string | undefined => {
  const reducer = identifierName(call.callee);
  const [stateArgument, actionArgument] = call.arguments;
  const isForwarded = call.arguments.length === 2 && isIdentifierNamed(stateArgument, state) && isIdentifierNamed(actionArgument, action);
  const isForwardingCall = !call.optional && isChildReducerName(reducer) && isForwarded;
  return isForwardingCall ? reducer : undefined;
};

const getReturnedReducer = (
  statements: readonly Statement[], state: string, action: string,
): string | undefined => {
  const [statement] = statements;
  if (statements.length !== 1) return undefined;
  if (statement?.type === "BlockStatement") return getReturnedReducer(statement.body, state, action);
  const call = returnedCall(statement);
  return call === undefined ? undefined : forwardedReducer(call, state, action);
};

/** Each case body with the explicit labels that fall through to it; trailing empty cases have no body. */
const routedCases = (cases: readonly SwitchCase[], state: string, action: string): readonly RoutedCase[] => {
  const bodyIndexes = cases.flatMap((branch, index) => branch.consequent.length === 0 ? [] : [index]);
  return bodyIndexes.map((bodyIndex, position) => {
    const firstIndex = (bodyIndexes[position - 1] ?? -1) + 1;
    const labels = cases.slice(firstIndex, bodyIndex + 1).filter((branch) => branch.test !== null);
    const body = cases[bodyIndex]?.consequent ?? [];
    return { reducer: getReturnedReducer(body, state, action), labels };
  });
};

/** Every explicit label routed to each child reducer, in order of the reducer's first case. */
const labelsByReducer = (routed: readonly RoutedCase[]): readonly (readonly [string, readonly SwitchCase[]])[] => {
  const reducers = [...new Set(routed.map((routedCase) => routedCase.reducer))].filter(isPresent);
  return reducers.map((reducer) => [reducer, routed.filter((routedCase) => routedCase.reducer === reducer).flatMap((routedCase) => routedCase.labels)]);
};

const implementation: Rule.RuleModule = {
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
        if (parameters === undefined) return;
        const [state, action] = parameters;
        if (!isActionTypeRead(node.discriminant, action)) return;
        const repeatedRoutes = labelsByReducer(routedCases(node.cases, state, action)).filter(([, labels]) => labels.length >= 2);
        for (const [reducer, [firstLabel]] of repeatedRoutes) {
          if (firstLabel !== undefined) {
            context.report(withPlaceholders({ node: firstLabel, messageId: "domainRouting" }, { reducer }));
          }
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
