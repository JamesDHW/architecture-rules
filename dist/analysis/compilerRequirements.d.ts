import type { Architecture } from "../config/types.js";
import type { Issue } from "./inventory.js";
type CompilerOptions = Readonly<Record<string, unknown>>;
/** Effective compiler settings a project must keep, given the rules the architecture leaves on. */
export declare const compilerIssues: (architecture: Architecture, project: string, options: CompilerOptions) => readonly Issue[];
export {};
//# sourceMappingURL=compilerRequirements.d.ts.map