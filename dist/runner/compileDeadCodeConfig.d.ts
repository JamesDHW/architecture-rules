import type { ClassifiedFile } from "../analysis/inventory.js";
/** Whether the file is an entry: its layer is marked entry, and the entry's files (all, by default) include it. */
export declare const isEntryFile: (file: ClassifiedFile) => boolean;
export type DeadCodeConfig = {
    readonly entry: readonly string[];
    readonly project: readonly string[];
    readonly includeEntryExports: boolean;
};
/**
 * The dead-code engine's configuration, compiled from the inventory: TypeScript decides which files exist, and
 * layer entries decide where reachability starts. With countEntryExports, exports of entry files are reported too.
 */
export declare const compileDeadCodeConfig: (files: readonly ClassifiedFile[], countEntryExports: boolean) => DeadCodeConfig;
//# sourceMappingURL=compileDeadCodeConfig.d.ts.map