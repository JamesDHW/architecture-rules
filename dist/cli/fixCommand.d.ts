import { ArchitectureError } from "../errors/architectureError.js";
type FixArgs = {
    readonly target: string;
    readonly config?: string;
    readonly rule: string;
    readonly paths: readonly string[];
};
/**
 * architecture-check fix --rule <id>: fixes every finding of a rule whose fix is mechanical, in one sweep. Naming
 * renames files and updates their imports; deep relative imports go through the projects' path aliases.
 */
export declare const fixCommand: (args: FixArgs) => Promise<number | ArchitectureError>;
export {};
//# sourceMappingURL=fixCommand.d.ts.map