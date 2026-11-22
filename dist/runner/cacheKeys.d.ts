import type { ImportAnalysis } from "../analysis/imports.js";
import type { ClassifiedFile } from "../analysis/inventory.js";
import type { Projects } from "../analysis/projects.js";
import type { Architecture } from "../config/types.js";
/** What a cached result depends on: everything a check reads, so a matching key means the same findings. */
export type CacheKeys = {
    /** Lint and compiler results for this file: its policy, its import problems, and the content of everything it imports. */
    readonly fileKey: (file: ClassifiedFile) => string;
    /** Dead-code results: every file and every setting. */
    readonly programKey: string;
    /** Program-wide compiler errors: every setting, plus the files that can declare globals. */
    readonly globalScopeKey: string;
};
/**
 * Keys for the analysis cache. Declaration files and lockfiles go into every key: an ambient type or a package
 * upgrade changes findings in files that import neither.
 */
export declare const cacheKeys: (root: string, architecture: Architecture, opened: Projects, files: readonly ClassifiedFile[], imports: ImportAnalysis, workspaces: readonly string[]) => CacheKeys;
//# sourceMappingURL=cacheKeys.d.ts.map