import type { ImportAnalysis } from "../analysis/imports.js";
import type { ClassifiedFile } from "../analysis/inventory.js";
import type { LineException } from "../analysis/suppressions.js";
import type { Architecture } from "../config/types.js";
import { type Finding } from "./findings.js";
/** The stages of a check, in the order they run. */
type StageName = "structure" | "lint" | "types" | "program" | "dead-code";
export type StageStatus = "passed" | "failed" | "skipped";
export type Stage = {
    readonly name: StageName;
    readonly status: StageStatus;
};
/** What one check found, ready for any output: text, JSON, the Markdown report or the language server. */
export type CheckResult = {
    readonly architecture: Architecture;
    /** architecture.config.ts, root-relative: findings about it are counted as configuration, not under a layer. */
    readonly configFile: string;
    readonly projects: number;
    /** The classified files in scope: every file, or the --file selection. */
    readonly files: readonly ClassifiedFile[];
    readonly findings: readonly Finding[];
    readonly exceptions: readonly LineException[];
    readonly stages: readonly Stage[];
    readonly durationMs: number;
    /** False when structural findings stopped the run before lint, types and dead code. */
    readonly complete: boolean;
    /** Workspace package directories, root-relative, longest first; from every file, whatever the selection. */
    readonly workspaces: readonly string[];
    /** Whether a --file selection limited the findings to some files. */
    readonly partial: boolean;
    /** Every import problem and every permission an import used; absent when structure stopped the run. */
    readonly imports?: ImportAnalysis;
};
export type CheckScope = {
    readonly architecture: Architecture;
    readonly configFile: string;
    readonly projects: number;
    readonly files: readonly ClassifiedFile[];
    readonly workspaces: readonly string[];
    readonly partial: boolean;
    /** performance.now() when the check started. */
    readonly started: number;
};
/** Assembles a check's result; stages after structure are skipped when structural findings stopped the run. */
export declare const checkResult: (scope: CheckScope, findings: readonly Finding[], exceptions: readonly LineException[], imports: ImportAnalysis | undefined) => CheckResult;
/** The same result with findings compared against a baseline; stages are judged again, since recorded debt passes. */
export declare const withFindings: (result: CheckResult, findings: readonly Finding[]) => CheckResult;
/** Whether any finding fails the check; recorded debt in untouched files does not. */
export declare const hasErrors: (result: CheckResult) => boolean;
export {};
//# sourceMappingURL=checkResult.d.ts.map