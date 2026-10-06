import type { Architecture } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";
export type CheckOptions = {
    readonly fix?: boolean;
    readonly explain?: string;
};
/** Checks the architecture rooted at root: structure first, then lint, then compiler diagnostics. */
export declare const checkArchitecture: (rootPath: string, architecture: Architecture, options?: CheckOptions) => Promise<number | ArchitectureError>;
//# sourceMappingURL=runner.d.ts.map