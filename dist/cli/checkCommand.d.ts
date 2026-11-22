import { ArchitectureError } from "../errors/architectureError.js";
import type { RunArgs } from "./cliArgs.js";
/**
 * The check: every finding compared with the baseline, the baseline pruned of fixed debt (outside CI), and the exit
 * code of the first gate that fails.
 */
export declare const checkCommand: (args: RunArgs) => Promise<number | ArchitectureError>;
//# sourceMappingURL=checkCommand.d.ts.map