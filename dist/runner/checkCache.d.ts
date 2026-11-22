import type { ClassifiedFile } from "../analysis/inventory.js";
import type { CacheKeys } from "./cacheKeys.js";
import type { Finding } from "./findings.js";
/** One stage's cached findings for one file, under the key they were computed with. */
type Entry = {
    readonly key: string;
    readonly findings: readonly Finding[];
};
/** What the cache file holds: lint and compiler findings per file, and the dead-code findings of the whole program. */
export type CacheContents = {
    readonly lint: ReadonlyMap<string, Entry>;
    readonly compiler: ReadonlyMap<string, Entry>;
    readonly deadCode?: Entry;
};
/** The cache as last written; anything unreadable, or from another version, is an empty cache. */
export declare const readCache: (root: string) => CacheContents;
/** Replaces the cache file in one step, so a concurrent reader never sees half a file. A failure only costs speed. */
export declare const writeCache: (root: string, contents: CacheContents) => void;
/** Files whose cached findings no longer match their key, and the findings of the ones that still do. */
export type Split = {
    readonly stale: readonly ClassifiedFile[];
    readonly cached: readonly Finding[];
};
export declare const splitByCache: (files: readonly ClassifiedFile[], cached: ReadonlyMap<string, Entry>, keys: CacheKeys) => Split;
/** Findings by the file they were computed for, under each file's current key. */
export declare const entriesFor: (files: readonly ClassifiedFile[], findings: readonly Finding[], keys: CacheKeys, previous: ReadonlyMap<string, Entry>, stale: readonly ClassifiedFile[]) => ReadonlyMap<string, Entry>;
export {};
//# sourceMappingURL=checkCache.d.ts.map