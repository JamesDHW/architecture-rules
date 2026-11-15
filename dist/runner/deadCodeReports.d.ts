import { ArchitectureError } from "../errors/architectureError.js";
/** One unused or unlisted thing the dead-code engine reported. */
export type Report = {
    readonly type: string;
    readonly file: string;
    readonly name: string;
    readonly line?: number;
    readonly column?: number;
};
/** Every report in the engine's JSON output. */
export declare const parseReports: (output: string) => readonly Report[] | ArchitectureError;
/** The engine's issue types, under the architecture rule that owns them. Types not listed are not reported. */
export declare const ruleByIssueType: Readonly<Record<string, string>>;
export declare const projectRules: ReadonlySet<string>;
export declare const exportRules: ReadonlySet<string>;
export declare const message: (ruleId: string, report: Report, developmentOnly: boolean) => string;
export declare const devDependencyMessage: (report: Report) => string;
//# sourceMappingURL=deadCodeReports.d.ts.map