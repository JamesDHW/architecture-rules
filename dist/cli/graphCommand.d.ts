import { ArchitectureError } from "../errors/architectureError.js";
import type { GraphFormat } from "./cliArgs.js";
type GraphArgs = {
    readonly target: string;
    readonly config?: string;
    readonly format: GraphFormat;
    readonly layer?: string;
};
/** The architecture as the rules declare it, overlaid with what the code imports. */
export declare const graphCommand: (args: GraphArgs) => Promise<number | ArchitectureError>;
export {};
//# sourceMappingURL=graphCommand.d.ts.map