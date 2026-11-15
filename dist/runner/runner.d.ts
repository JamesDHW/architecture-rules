import type { Architecture } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { type CheckResult } from "./checkResult.js";
import { type OutputFormat } from "./output.js";
export type InspectOptions = {
    readonly fix?: boolean;
    /** Absolute paths: lint and report only these files. The whole project is still analyzed. */
    readonly files?: readonly string[];
    /** The architecture configuration's path, for findings about it; architecture.config.ts in the root by default. */
    readonly configFile?: string;
};
export type CheckOptions = InspectOptions & {
    readonly explain?: string;
    readonly format?: OutputFormat;
};
/**
 * Checks the architecture rooted at rootPath and returns every finding without printing anything:
 * structure first, then lint, then compiler diagnostics. The CLI and the language server both render this.
 */
export declare const inspectArchitecture: (rootPath: string, architecture: Architecture, options?: InspectOptions) => Promise<CheckResult | ArchitectureError>;
/** Checks the architecture and prints the result; resolves to the process exit code. */
export declare const checkArchitecture: (rootPath: string, architecture: Architecture, options?: CheckOptions) => Promise<number | ArchitectureError>;
//# sourceMappingURL=runner.d.ts.map