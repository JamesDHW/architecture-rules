import { ArchitectureError } from "../errors/architectureError.js";
import type { DescribeFormat, RunArgs } from "./parseArgs.js";
/** Prints the architecture from configuration alone; no TypeScript program is opened, so it is fast. */
export declare const describeCommand: (args: RunArgs, format: DescribeFormat) => Promise<number | ArchitectureError>;
//# sourceMappingURL=describeCommand.d.ts.map