import type { Project } from "typescript/unstable/sync";
import type { ClassifiedFile, Issue } from "./inventory.js";
/** A reasoned line exception: where it is, the line it applies to, which rules it turns off and why. */
export type LineException = {
    readonly file: string;
    /** Where the comment starts. */
    readonly line: number;
    /** The line whose findings it excepts. */
    readonly target: number;
    readonly rules: readonly string[];
    readonly reason: string;
};
type Read = {
    readonly exceptions: readonly LineException[];
    readonly issues: readonly Issue[];
};
/**
 * Reads every line exception in the files. Malformed exceptions, unknown or structural rules and engine
 * directive comments are structural issues, found before lint so no comment can switch a check off.
 */
export declare const readExceptions: (files: readonly ClassifiedFile[], projects: readonly Project[]) => Read;
/** A replacement of part of one source file. */
export type SourceEdit = {
    readonly path: string;
    readonly start: number;
    readonly end: number;
    readonly replacement: string;
};
/** Edits that rewrite reasoned engine disable comments into exceptions, for --fix. Comments naming unknown rules are left alone. */
export declare const exceptionMigrations: (files: readonly ClassifiedFile[], projects: readonly Project[]) => readonly SourceEdit[];
export {};
//# sourceMappingURL=suppressions.d.ts.map