import { existsSync } from "node:fs";
import { join } from "node:path";

import type { ClassifiedFile } from "../analysis/inventory.js";
import type { Projects } from "../analysis/projects.js";
import type { ArchitectureError } from "../errors/architectureError.js";
import { PER_FILE_COMPILER_SHARE, PROGRAM_ENTRY } from "./checkCache.constants.js";
import type { CacheKeys } from "./cacheKeys.js";
import { entriesFor, splitByCache, type CacheContents } from "./checkCache.js";
import { compilerFindings, programFindings, sourceFindings } from "./compilerDiagnostics.js";
import { deadCode, type DeadCodeScope } from "./deadCode.js";
import type { Finding } from "./findings.js";

/** The cache a check reads, and the keys the current files have. */
export type Cache = { readonly contents: CacheContents; readonly keys: CacheKeys };

type CompilerStage = { readonly findings: readonly Finding[]; readonly entries: CacheContents["compiler"] };

/**
 * Compiler errors: file by file for the few files whose key changed, with the rest from the cache; one
 * whole-program pass when many changed, or without a cache.
 */
export const compilerStage = (root: string, opened: Projects, files: readonly ClassifiedFile[], cache: Cache | undefined): CompilerStage => {
  if (cache === undefined) return { findings: compilerFindings(root, opened.projects), entries: new Map() };
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


const noManifestFinding: Finding = {
  source: "dead-code", severity: "warning", ruleId: "unused-dependencies", file: "package.json",
  message: "There is no package.json in the architecture root, so unused files, exports and dependencies were not checked.",
};

/** Dead code depends on every file and setting, so its cached findings hold only while nothing at all changed. */
export const deadCodeStage = async (root: string, scope: DeadCodeScope, cache: Cache | undefined): Promise<readonly Finding[] | ArchitectureError> => {
  if (!existsSync(join(root, "package.json"))) return [noManifestFinding];
  const cached = cache?.contents.deadCode;
  const isCurrent = cached !== undefined && cached.key === cache?.keys.programKey;
  if (isCurrent) return cached.findings;
  return deadCode(root, scope);
};
