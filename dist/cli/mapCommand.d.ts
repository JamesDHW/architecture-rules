import { ArchitectureError } from "../errors/architectureError.js";
type MapArgs = {
    readonly target: string;
    readonly config?: string;
    readonly json: boolean;
};
/**
 * Which layer each source file belongs to, and the files no layer (or several) claims. Adoption loops on this until
 * every file is classified; a classification problem cannot be excepted or baselined, so it exits 1.
 */
export declare const mapCommand: (args: MapArgs) => Promise<number | ArchitectureError>;
export {};
//# sourceMappingURL=mapCommand.d.ts.map