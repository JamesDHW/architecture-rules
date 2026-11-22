import { ArchitectureError } from "../errors/architectureError.js";
type StatusArgs = {
    readonly target: string;
    readonly config?: string;
    readonly json: boolean;
    readonly since?: string;
};
/** Per layer: how many files comply, what debt is recorded and by which rules, and with --since how that changed. */
export declare const statusCommand: (args: StatusArgs) => Promise<number | ArchitectureError>;
export {};
//# sourceMappingURL=statusCommand.d.ts.map