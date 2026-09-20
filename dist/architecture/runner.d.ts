import type { Architecture } from "./types.js";
import { type Issue } from "./inventory.js";
export declare const printIssues: (issues: readonly Issue[]) => void;
export declare const checkArchitecture: (root: string, architecture: Architecture, options?: {
    readonly fix?: boolean;
    readonly explain?: string;
}) => Promise<number>;
//# sourceMappingURL=runner.d.ts.map