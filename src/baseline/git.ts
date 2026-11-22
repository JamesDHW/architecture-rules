import { spawnSync } from "node:child_process";

import { ArchitectureError } from "../errors/architectureError.js";
import { tryCatch } from "../errors/tryCatch.js";

/** Runs git in the root and returns its output; a non-zero exit is an error carrying git's own message. */
export const git = (root: string, args: readonly string[]): string | ArchitectureError => {
  const result = tryCatch(() => spawnSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
  if (result instanceof ArchitectureError) return result;
  if (result.error !== undefined) return new ArchitectureError([`git could not start: ${result.error.message}`]);
  if (result.status === 0) return result.stdout;
  return new ArchitectureError([`git ${args.join(" ")} failed: ${result.stderr.trim()}`]);
};

/** A file's text at a revision, or undefined when it does not exist there. Paths are relative to the root. */
export const showAt = (root: string, revision: string, path: string): string | undefined => {
  const shown = git(root, ["show", `${revision}:./${path}`]);
  return shown instanceof ArchitectureError ? undefined : shown;
};

/** Stages files so the commit in progress includes them. */
export const stage = (root: string, paths: readonly string[]): string | ArchitectureError => {
  return paths.length === 0 ? "" : git(root, ["add", "--", ...paths]);
};
