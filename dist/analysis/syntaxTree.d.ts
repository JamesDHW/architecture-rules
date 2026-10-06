import type { Node } from "typescript/unstable/ast";
/** TypeScript's AST exposes children only through a forEachChild callback, so they are collected here once. */
export declare const childrenOf: (node: Node) => readonly Node[];
/** The node followed by every node beneath it, in source order. */
export declare const descendants: (node: Node) => readonly Node[];
//# sourceMappingURL=syntaxTree.d.ts.map