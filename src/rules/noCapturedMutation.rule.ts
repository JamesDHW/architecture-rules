import path from "node:path";
import type { Rule } from "eslint";

import { defineRule } from "../core/defineRule.js";

const DESCRIPTION = `
Do not change an array, object, Map or Set from a function other than the one
that created it. State that must outlive a function call (a registry of live
connections, requests waiting for a reply) lives in a *.state.ts module, which
exports a factory of named operations. Building a value inside one function call
is not state and stays allowed.

Good (one call builds and returns it):
  const failures: CheckFailure[] = [];
  for (const check of checks) { ... failures.push(failure); }
  return failures;
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

type Node = Rule.Node;
type AnyNode = { readonly type: string; readonly [key: string]: unknown };

const unwrap = (node: AnyNode | null | undefined): AnyNode | null | undefined => {
  const isWrapper = node?.type === "TSAsExpression" || node?.type === "TSSatisfiesExpression" || node?.type === "TSNonNullExpression" || node?.type === "ParenthesizedExpression";
  return isWrapper ? unwrap(node.expression as AnyNode) : node;
};

const isContainerCreation = (init: AnyNode | null | undefined): boolean => {
  const value = unwrap(init);
  if (value === null || value === undefined) return false;
  if (value.type === "ArrayExpression" || value.type === "ObjectExpression") return true;
  if (value.type !== "NewExpression") return false;
  const callee = value.callee as AnyNode;
  return callee.type === "Identifier" && CONTAINER_CONSTRUCTORS.has(callee.name as string);
};

/** The identifier at the root of a.b.c, or undefined when the chain passes through a call. */
const rootIdentifier = (node: AnyNode): AnyNode | undefined => {
  const value = unwrap(node);
  if (value?.type === "Identifier") return value;
  if (value?.type === "MemberExpression") return rootIdentifier(value.object as AnyNode);
  return undefined;
};

const enclosingFunctionScope = (scope: ReturnType<Rule.RuleContext["sourceCode"]["getScope"]>) => scope.variableScope;

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

    const check = (target: AnyNode, at: Node): void => {
      const root = rootIdentifier(target);
      if (root === undefined) return;
      const scope = context.sourceCode.getScope(at);
      const reference = [...scope.references, ...scope.through].find((candidate) => candidate.identifier === (root as unknown));
      const variable = reference?.resolved ?? findVariable(scope, root.name as string);
      const definition = variable?.defs[0];
      if (variable === null || variable === undefined || definition?.type !== "Variable") return;
      const declarator = definition.node as unknown as AnyNode;
      if (!isContainerCreation(declarator.init as AnyNode)) return;
      if (enclosingFunctionScope(variable.scope) === enclosingFunctionScope(scope)) return;
      context.report({ node: at, messageId: "capturedMutation", data: { name: variable.name } });
    };

    return {
      CallExpression(node) {
        const callee = node.callee as unknown as AnyNode;
        if (callee.type !== "MemberExpression" || callee.computed === true) return;
        const property = callee.property as AnyNode;
        if (property.type !== "Identifier" || !MUTATING_METHODS.has(property.name as string)) return;
        check(callee.object as AnyNode, node);
      },
      AssignmentExpression(node) {
        const left = node.left as unknown as AnyNode;
        if (left.type === "MemberExpression") check(left, node);
      },
      UpdateExpression(node) {
        const argument = node.argument as unknown as AnyNode;
        if (argument.type === "MemberExpression") check(argument, node);
      },
      UnaryExpression(node) {
        const argument = node.argument as unknown as AnyNode;
        if (node.operator === "delete" && argument.type === "MemberExpression") check(argument, node);
      },
    };
  },
};

type Scope = ReturnType<Rule.RuleContext["sourceCode"]["getScope"]>;
const findVariable = (scope: Scope | null, name: string): Scope["variables"][number] | undefined => {
  if (scope === null) return undefined;
  return scope.set.get(name) ?? findVariable(scope.upper, name);
};

export const noCapturedMutationRule = defineRule({
  id: "no-captured-mutation",
  title: "Keep long-lived state in *.state.ts modules",
  description: DESCRIPTION,
  enforcement: { type: "custom-oxlint", configuration: "error", implementation },
});
