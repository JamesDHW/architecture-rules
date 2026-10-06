import type { AST } from "eslint";
/**
 * A node as Oxlint delivers it: ESTree plus TypeScript-ESTree, read structurally.
 * ESLint's types only describe ESTree, so TypeScript-specific fields are read
 * through these helpers instead of type assertions.
 */
export type SyntaxNode = Readonly<Record<string, unknown>> & {
    readonly type: string;
};
export declare const isSyntaxNode: (value: unknown) => value is SyntaxNode;
export declare const isNodeOfType: (value: unknown, type: string) => value is SyntaxNode;
/** The child node stored under key, when there is one. */
export declare const childNode: (node: unknown, key: string) => SyntaxNode | undefined;
/** The child nodes stored under key, ignoring holes and non-node entries. */
export declare const childNodes: (node: unknown, key: string) => readonly SyntaxNode[];
export declare const stringProperty: (node: unknown, key: string) => string | undefined;
/** The name of an Identifier node; undefined for any other node. */
export declare const identifierName: (node: unknown) => string | undefined;
/** Every direct child node, excluding the parent back-reference. */
export declare const directChildren: (node: SyntaxNode) => readonly SyntaxNode[];
/** Report position for a structurally read node: context.report({ loc: locationOf(node), ... }). */
export declare const locationOf: (node: SyntaxNode) => AST.SourceLocation | undefined;
//# sourceMappingURL=syntaxNode.d.ts.map