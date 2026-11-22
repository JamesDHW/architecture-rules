import { ArchitectureError } from "../errors/architectureError.js";
type BaselineArgs = {
    readonly target: string;
    readonly config?: string;
    readonly accept: boolean;
    readonly rules: readonly string[];
    readonly reason?: string;
};
/**
 * architecture-check baseline: records today's errors as debt the first time, then only removes fixed debt. Growth
 * needs --accept with a reason; --rule records just one newly enabled rule's findings.
 */
export declare const baselineCommand: (args: BaselineArgs) => Promise<number | ArchitectureError>;
export {};
//# sourceMappingURL=baselineCommand.d.ts.map