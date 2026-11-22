import type { ClassifiedFile } from "../analysis/inventory.js";
import type { Projects } from "../analysis/projects.js";
import type { ArchitectureError } from "../errors/architectureError.js";
import type { CacheKeys } from "./cacheKeys.js";
import { type CacheContents } from "./checkCache.js";
import { type DeadCodeScope } from "./deadCode.js";
import type { Finding } from "./findings.js";
/** The cache a check reads, and the keys the current files have. */
export type Cache = {
    readonly contents: CacheContents;
    readonly keys: CacheKeys;
};
type CompilerStage = {
    readonly findings: readonly Finding[];
    readonly entries: CacheContents["compiler"];
};
/**
 * Compiler errors: file by file for the few files whose key changed, with the rest from the cache; one
 * whole-program pass when many changed, or without a cache.
 */
export declare const compilerStage: (root: string, opened: Projects, files: readonly ClassifiedFile[], cache: Cache | undefined) => CompilerStage;
/** Dead code depends on every file and setting, so its cached findings hold only while nothing at all changed. */
export declare const deadCodeStage: (root: string, scope: DeadCodeScope, cache: Cache | undefined) => Promise<readonly Finding[] | ArchitectureError>;
export {};
//# sourceMappingURL=cachedStages.d.ts.map