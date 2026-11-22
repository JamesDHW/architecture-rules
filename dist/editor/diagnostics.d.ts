import type { Finding } from "../runner/findings.js";
type Diagnostic = {
    readonly range: {
        readonly start: {
            readonly line: number;
            readonly character: number;
        };
        readonly end: {
            readonly line: number;
            readonly character: number;
        };
    };
    readonly severity: number;
    readonly tags?: readonly number[];
    readonly code: string;
    readonly codeDescription?: {
        readonly href: string;
    };
    readonly source: string;
    readonly message: string;
};
/** Diagnostics for one file, by its URI. */
export type FileDiagnostics = {
    readonly uri: string;
    readonly diagnostics: readonly Diagnostic[];
};
/**
 * Groups findings by file. Files that had diagnostics before and have none now get an empty list, so the editor
 * clears them.
 */
export declare const fileDiagnostics: (root: string, findings: readonly Finding[], previous: ReadonlySet<string>) => readonly FileDiagnostics[];
export {};
//# sourceMappingURL=diagnostics.d.ts.map