import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { ClassifiedFile } from "../analysis/inventory.js";
import { isRecord, isString, isUnknownArray } from "../core/guards.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { tryCatch } from "../errors/tryCatch.js";
import { CACHE_VERSION } from "./checkCache.constants.js";
import type { CacheKeys } from "./cacheKeys.js";
import type { Finding } from "./findings.js";

/** One stage's cached findings for one file, under the key they were computed with. */
type Entry = { readonly key: string; readonly findings: readonly Finding[] };

/** What the cache file holds: lint and compiler findings per file, and the dead-code findings of the whole program. */
export type CacheContents = {
  readonly lint: ReadonlyMap<string, Entry>;
  readonly compiler: ReadonlyMap<string, Entry>;
  readonly deadCode?: Entry;
};

const emptyCache: CacheContents = { lint: new Map(), compiler: new Map() };

/** In node_modules/.cache, as other tools do: ignored by git, removed with node_modules. No node_modules, no cache. */
const cacheFile = (root: string): string | undefined => {
  const modules = join(root, "node_modules");
  return existsSync(modules) ? join(modules, ".cache", "architecture-rules", "check.json") : undefined;
};

const isFinding = (value: unknown): value is Finding => isRecord(value) && isString(value.file) && isString(value.ruleId) && isString(value.message);

const entryOf = (value: unknown): Entry | undefined => {
  if (!isRecord(value)) return undefined;
  const { key, findings } = value;
  const list = isUnknownArray(findings) ? findings : [];
  const isEntry = isString(key) && isUnknownArray(findings) && list.every(isFinding);
  return isEntry ? { key, findings: list.filter(isFinding) } : undefined;
};

const entries = (value: unknown): ReadonlyMap<string, Entry> => {
  if (!isRecord(value)) return new Map();
  return new Map(Object.entries(value).flatMap(([file, entry]) => {
    const read = entryOf(entry);
    return read === undefined ? [] : [[file, read] as const];
  }));
};

/** The cache as last written; anything unreadable, or from another version, is an empty cache. */
export const readCache = (root: string): CacheContents => {
  const path = cacheFile(root);
  const isMissing = path === undefined || !existsSync(path);
  if (isMissing) return emptyCache;
  const parsed = tryCatch((): unknown => JSON.parse(readFileSync(path, "utf8")));
  const isCurrent = isRecord(parsed) && parsed.version === CACHE_VERSION;
  if (!isCurrent) return emptyCache;
  const deadCode = entryOf(parsed.deadCode);
  return { lint: entries(parsed.lint), compiler: entries(parsed.compiler), ...(deadCode === undefined ? {} : { deadCode }) };
};

/** Replaces the cache file in one step, so a concurrent reader never sees half a file. A failure only costs speed. */
export const writeCache = (root: string, contents: CacheContents): void => {
  const path = cacheFile(root);
  if (path === undefined) return;
  const document = {
    version: CACHE_VERSION,
    lint: Object.fromEntries(contents.lint),
    compiler: Object.fromEntries(contents.compiler),
    ...(contents.deadCode === undefined ? {} : { deadCode: contents.deadCode }),
  };
  const written = tryCatch(() => {
    mkdirSync(join(path, ".."), { recursive: true });
    const temporary = `${path}.${process.pid}.tmp`;
    writeFileSync(temporary, JSON.stringify(document));
    renameSync(temporary, path);
  });
  if (written instanceof ArchitectureError) {
    process.stderr.write(`architecture-check: the analysis cache was not written: ${written.message}\n`);
  }
};

/** Files whose cached findings no longer match their key, and the findings of the ones that still do. */
export type Split = { readonly stale: readonly ClassifiedFile[]; readonly cached: readonly Finding[] };

export const splitByCache = (files: readonly ClassifiedFile[], cached: ReadonlyMap<string, Entry>, keys: CacheKeys): Split => {
  const fresh = (file: ClassifiedFile): boolean => cached.get(file.relative)?.key === keys.fileKey(file);
  return {
    stale: files.filter((file) => !fresh(file)),
    cached: files.filter(fresh).flatMap((file) => cached.get(file.relative)?.findings ?? []),
  };
};

/** Findings by the file they were computed for, under each file's current key. */
export const entriesFor = (files: readonly ClassifiedFile[], findings: readonly Finding[], keys: CacheKeys, previous: ReadonlyMap<string, Entry>, stale: readonly ClassifiedFile[]): ReadonlyMap<string, Entry> => {
  const recomputed = new Set(stale.map((file) => file.relative));
  const byFile = Map.groupBy(findings, (finding) => finding.file);
  return new Map(files.flatMap((file) => {
    const entry = recomputed.has(file.relative) ? { key: keys.fileKey(file), findings: byFile.get(file.relative) ?? [] } : previous.get(file.relative);
    return entry === undefined ? [] : [[file.relative, entry] as const];
  }));
};
