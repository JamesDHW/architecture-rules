import type { ClassifiedFile } from "../analysis/inventory.js";
import type { Suppression } from "../analysis/suppressions.js";
import type { Architecture } from "../config/types.js";
import type { Finding } from "./findings.js";
export type ReportInput = {
    readonly architecture: Architecture;
    readonly files: readonly ClassifiedFile[];
    readonly findings: readonly Finding[];
    readonly suppressions: readonly Suppression[];
};
/** A Markdown report of the check: findings by rule, every suppression, configuration overrides and file types. */
export declare const renderReport: ({ architecture, files, findings, suppressions }: ReportInput) => string;
//# sourceMappingURL=markdownReport.d.ts.map