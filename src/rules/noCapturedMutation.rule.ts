import path from "node:path";
import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";
import { isString } from "../core/guards.js";
import { CONTAINER_CONSTRUCTORS, CONTAINER_MUTATING_METHODS } from "./noCapturedMutation.constants.js";
import { childNode, isNodeOfType, type SyntaxNode } from "./syntaxNode.js";
import { withPlaceholders } from "./messagePlaceholders.js";

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

type Scope = ReturnType<Rule.RuleContext["sourceCode"]["getScope"]>;
type Variable = Scope["variables"][number];
type CallNode = Parameters<NonNullable<Rule.RuleListener["CallExpression"]>>[0];
type IdentifierNode = SyntaxNode & { readonly name: string };

const isIdentifier = (node: unknown): node is IdentifierNode => isNodeOfType(node, "Identifier") && isString(node.name);

const isWrapper = (node: SyntaxNode | undefined): boolean => {
  return node?.type === "TSAsExpression" || node?.type === "TSSatisfiesExpression" || node?.type === "TSNonNullExpression" || node?.type === "ParenthesizedExpression";
};

/** The expression inside any as, satisfies, non-null or parenthesis wrappers. */
const unwrap = (node: SyntaxNode | undefined): SyntaxNode | undefined => {
  return isWrapper(node) ? unwrap(childNode(node, "expression")) : node;
};

/** [], {}, or new Map, Set, WeakMap, WeakSet, Array or Object, possibly wrapped. */
const isContainerCreation = (init: SyntaxNode | undefined): boolean => {
  const value = unwrap(init);
  if (value?.type !== "NewExpression") return value?.type === "ArrayExpression" || value?.type === "ObjectExpression";
  const callee = childNode(value, "callee");
  return isIdentifier(callee) && CONTAINER_CONSTRUCTORS.has(callee.name);
};

/** The identifier at the root of a.b.c, or undefined when the chain passes through a call. */
const rootIdentifier = (node: SyntaxNode | undefined): IdentifierNode | undefined => {
  const value = unwrap(node);
  if (value?.type === "MemberExpression") return rootIdentifier(childNode(value, "object"));
  return isIdentifier(value) ? value : undefined;
};

/** The member expression a mutation writes through, such as box.current in box.current = 1. */
const memberTarget = (node: unknown): SyntaxNode | undefined => isNodeOfType(node, "MemberExpression") ? node : undefined;

/** The object a mutating method call such as pending.set(id, request) changes. */
const mutatedObject = (callee: CallNode["callee"]): SyntaxNode | undefined => {
  if (callee.type !== "MemberExpression") return undefined;
  const isMutatingCall = !callee.computed && isIdentifier(callee.property) && CONTAINER_MUTATING_METHODS.has(callee.property.name);
  return isMutatingCall ? childNode(callee, "object") : undefined;
};

const enclosingFunctionScope = (scope: Scope): Scope => scope.variableScope;

const findVariable = (scope: Scope | null, name: string): Variable | undefined => {
  if (scope === null) return undefined;
  return scope.set.get(name) ?? findVariable(scope.upper, name);
};

/** A variable whose declaration initializes it with a container. */
const isDeclaredContainer = (variable: Variable | undefined): variable is Variable => {
  const definition = variable?.defs[0];
  return definition?.type === "Variable" && isContainerCreation(childNode(definition.node, "init"));
};

/** The variable root names, when it holds a container created in a function other than the one enclosing scope. */
const capturedContainer = (root: IdentifierNode, scope: Scope): Variable | undefined => {
  const reference = [...scope.references, ...scope.through].find((candidate) => candidate.identifier === root);
  const variable = reference?.resolved ?? findVariable(scope, root.name);
  const isCaptured = isDeclaredContainer(variable) && enclosingFunctionScope(variable.scope) !== enclosingFunctionScope(scope);
  return isCaptured ? variable : undefined;
};

const implementation: Rule.RuleModule = {
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
    if (/\.state\.[cm]?tsx?$/.test(filename)) return {};

    const check = (target: SyntaxNode | undefined, at: Rule.Node): void => {
      const root = rootIdentifier(target);
      if (root === undefined) return;
      const variable = capturedContainer(root, context.sourceCode.getScope(at));
      if (variable === undefined) return;
      context.report(withPlaceholders({ node: at, messageId: "capturedMutation" }, { name: variable.name }));
    };

    return {
      CallExpression(node) {
        check(mutatedObject(node.callee), node);
      },
      AssignmentExpression(node) {
        check(memberTarget(node.left), node);
      },
      UpdateExpression(node) {
        check(memberTarget(node.argument), node);
      },
      UnaryExpression(node) {
        if (node.operator !== "delete") return;
        check(memberTarget(node.argument), node);
      },
    };
  },
};

export const noCapturedMutationRule = defineRule({
  id: "no-captured-mutation",
  title: "Keep long-lived state in *.state.ts modules",
  description: DESCRIPTION,
  enforcement: { type: "custom-oxlint", configuration: "error", implementation },
});
