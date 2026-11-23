/** Bump when the cache's shape or what its keys cover changes, so older caches are ignored. */
export const CACHE_VERSION = 2;

/** Lockfiles whose change can change types and dead-code results without any source changing. */
export const LOCKFILES: readonly string[] = ["pnpm-lock.yaml", "package-lock.json", "yarn.lock", "bun.lock", "bun.lockb"];

/** The compiler cache's entry for errors that belong to no one file. */
export const PROGRAM_ENTRY = "#program";

/** Above this share of changed files, one whole-program compiler pass beats asking file by file. */
export const PER_FILE_COMPILER_SHARE = 0.25;
