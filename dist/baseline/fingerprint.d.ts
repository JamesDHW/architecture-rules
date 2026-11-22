import type { Finding } from "../runner/findings.js";
/**
 * What identifies one recorded violation: the file, the rule and the message. Positions are left out, so moving
 * code within a file or reordering imports keeps the identity. Numbers are masked: a message such as a file's
 * line count changes as the file changes, without becoming a different violation.
 */
export type Fingerprint = {
    readonly file: string;
    readonly rule: string;
    readonly message: string;
};
/**
 * Lint, compiler and dead-code errors can be recorded as debt. Structural findings stop the run and warnings never
 * fail it, so neither is recorded.
 */
export declare const isBaselineable: (finding: Finding) => boolean;
export declare const fingerprintOf: (finding: Finding) => Fingerprint;
export declare const fingerprintKey: ({ file, rule, message }: Fingerprint) => string;
//# sourceMappingURL=fingerprint.d.ts.map