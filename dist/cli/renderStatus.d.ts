import type { Verdict } from "../baseline/judge.js";
export type LayerStatus = {
    readonly layer: string;
    readonly files: number;
    /** Files with no error, recorded or not. */
    readonly compliant: number;
    readonly new: number;
    readonly recorded: number;
    readonly recordedAtBase?: number;
    readonly exceptions: number;
    readonly recordedByRule: readonly {
        readonly rule: string;
        readonly count: number;
    }[];
};
/** One row per layer and a total, as a table or JSON. */
export declare const renderStatus: (rows: readonly LayerStatus[], verdict: Verdict, json: boolean) => string;
//# sourceMappingURL=renderStatus.d.ts.map