/** Bump when the cache's shape or what its keys cover changes, so older caches are ignored. */
export declare const CACHE_VERSION = 2;
/** Lockfiles whose change can change types and dead-code results without any source changing. */
export declare const LOCKFILES: readonly string[];
/** The compiler cache's entry for errors that belong to no one file. */
export declare const PROGRAM_ENTRY = "#program";
/** Above this share of changed files, one whole-program compiler pass beats asking file by file. */
export declare const PER_FILE_COMPILER_SHARE = 0.25;
//# sourceMappingURL=checkCache.constants.d.ts.map