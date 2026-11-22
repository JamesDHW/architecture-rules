import { ArchitectureError } from "../errors/architectureError.js";
type DoctorArgs = {
    readonly target: string;
    readonly config?: string;
};
/**
 * architecture-check doctor: whether adoption is complete. The configuration loads, every file is classified, entry
 * points are declared, the baseline exists and is current (no new errors, no fixed debt still listed), and the
 * rules are enforced rather than observed. Exit 0 means done.
 */
export declare const doctorCommand: (args: DoctorArgs) => Promise<number | ArchitectureError>;
export {};
//# sourceMappingURL=doctorCommand.d.ts.map