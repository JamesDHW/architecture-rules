import type { ClassifiedFile } from "../analysis/inventory.js";
import { matches } from "../analysis/paths.js";
import { exactSelector } from "./compileOxlintConfig.js";

/** Whether the file is an entry: its layer is marked entry, and the entry's files (all, by default) include it. */
export const isEntryFile = (file: ClassifiedFile): boolean => {
  const { entry } = file.policy;
  if (entry === undefined) return false;
  return entry.files === undefined || matches(file.relative, entry.files);
};

/** The engine's production marker: a trailing ! keeps a pattern in production-only runs. Development layers never ship. */
const withMode = (file: ClassifiedFile): string => {
  const selector = exactSelector(file.relative);
  return file.policy.development ? selector : `${selector}!`;
};

export type DeadCodeConfig = { readonly entry: readonly string[]; readonly project: readonly string[]; readonly includeEntryExports: boolean };

/**
 * The dead-code engine's configuration, compiled from the inventory: TypeScript decides which files exist, and
 * layer entries decide where reachability starts. With countEntryExports, exports of entry files are reported too.
 */
export const compileDeadCodeConfig = (files: readonly ClassifiedFile[], countEntryExports: boolean): DeadCodeConfig => ({
  entry: files.filter(isEntryFile).map(withMode),
  project: files.map(withMode),
  includeEntryExports: countEntryExports,
});
