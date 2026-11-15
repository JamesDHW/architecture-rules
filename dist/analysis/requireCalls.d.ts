import { type CallExpression } from "typescript/unstable/ast";
import type { Project } from "typescript/unstable/sync";
/** A call of require, or of a require created with createRequire, loads a module. */
export declare const isModuleRequire: (project: Project, call: CallExpression) => boolean;
//# sourceMappingURL=requireCalls.d.ts.map