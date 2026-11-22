import { existsSync } from "node:fs";
import { join } from "node:path";
import { PER_FILE_COMPILER_SHARE, PROGRAM_ENTRY } from "./checkCache.constants.js";
import { entriesFor, splitByCache } from "./checkCache.js";
import { compilerFindings, programFindings, sourceFindings } from "./compilerDiagnostics.js";
import { deadCode } from "./deadCode.js";
/**
 * Compiler errors: file by file for the few files whose key changed, with the rest from the cache; one
 * whole-program pass when many changed, or without a cache.
 */
export const compilerStage = (root, opened, files, cache) => {
    if (cache === undefined)
        return { findings: compilerFindings(root, opened.projects), entries: new Map() };
    const programEntry = cache.contents.compiler.get(PROGRAM_ENTRY);
    const program = programEntry?.key === cache.keys.globalScopeKey ? programEntry.findings : programFindings(root, opened.projects);
    const split = splitByCache(files, cache.contents.compiler, cache.keys);
    const isWholeProgram = split.stale.length > PER_FILE_COMPILER_SHARE * files.length;
    const stalePaths = new Set(split.stale.map((file) => file.path));
    const fresh = sourceFindings(root, opened.projects, isWholeProgram ? undefined : stalePaths);
    const entries = entriesFor(files, fresh, cache.keys, cache.contents.compiler, isWholeProgram ? files : split.stale);
    return {
        findings: [...program, ...(isWholeProgram ? fresh : [...split.cached, ...fresh])],
        entries: new Map([...entries, [PROGRAM_ENTRY, { key: cache.keys.globalScopeKey, findings: program }]]),
    };
};
const noManifestFinding = {
    source: "dead-code", severity: "warning", ruleId: "unused-dependencies", file: "package.json",
    message: "There is no package.json in the architecture root, so unused files, exports and dependencies were not checked.",
};
/** Dead code depends on every file and setting, so its cached findings hold only while nothing at all changed. */
export const deadCodeStage = async (root, scope, cache) => {
    if (!existsSync(join(root, "package.json")))
        return [noManifestFinding];
    const cached = cache?.contents.deadCode;
    const isCurrent = cached !== undefined && cached.key === cache?.keys.programKey;
    if (isCurrent)
        return cached.findings;
    return deadCode(root, scope);
};
//# sourceMappingURL=cachedStages.js.map