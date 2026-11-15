import type { ClassifiedFile } from "../analysis/inventory.js";
import type { LineException } from "../analysis/suppressions.js";
import type { Architecture } from "../config/types.js";
import { type Finding } from "./findings.js";
/** The stages of a check, in the order they run. */
type StageName = "structure" | "lint" | "types" | "dead-code";
export type StageStatus = "passed" | "failed" | "skipped";
export type Stage = {
    readonly name: StageName;
    readonly status: StageStatus;
};
/** What one check found, ready for any output: text, JSON, the Markdown report or the language server. */
export type CheckResult = {
    readonly architecture: Architecture;
    readonly projects: number;
    /** The classified files in scope: every file, or the --file selection. */
    readonly files: readonly ClassifiedFile[];
    readonly findings: readonly Finding[];
    readonly exceptions: readonly LineException[];
    readonly stages: readonly Stage[];
    readonly durationMs: number;
};
export type CheckScope = {
    readonly architecture: Architecture;
    readonly projects: number;
    readonly files: readonly ClassifiedFile[];
    /** performance.now() when the check started. */
    readonly started: number;
};
/** Assembles a check's result; stages after structure are skipped when structural findings stopped the run. */
export declare const checkResult: (scope: CheckScope, findings: readonly Finding[], exceptions: readonly LineException[], ranPastStructure: boolean) => CheckResult;
export declare const hasErrors: (result: CheckResult) => boolean;
export {};
//# sourceMappingURL=checkResult.d.ts.map