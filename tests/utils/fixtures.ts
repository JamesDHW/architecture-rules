import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { expect, onTestFinished } from "vitest";

import { openProjects, type Projects } from "../../src/analysis/projects.js";
import type { Architecture } from "../../src/config/types.js";
import { ArchitectureError } from "../../src/errors/architectureError.js";
import { presetCompilerOptions } from "./preset.js";

/** A fresh directory, removed when the current test finishes. */
export const temporaryRoot = (prefix: string): string => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), prefix)));
  onTestFinished(() => {
    rmSync(root, { recursive: true, force: true });
  });
  return root;
};

export const writeFiles = (root: string, files: Readonly<Record<string, string>>): void => {
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), text);
  }
};

/** The preset's compiler options plus the given project settings, as tsconfig JSON. */
export const tsconfigJson = (compilerOptions: Readonly<Record<string, unknown>>, scope: Readonly<Record<string, unknown>>): string => {
  return JSON.stringify({ compilerOptions: { ...presetCompilerOptions(), ...compilerOptions }, ...scope });
};

/** Opens the fixture's TypeScript projects and closes them when the current test finishes. */
export const openFixtureProjects = (root: string, architecture: Architecture): Projects => {
  const opened = openProjects(root, architecture);
  if (opened instanceof ArchitectureError) return expect.unreachable(opened.message);
  onTestFinished(() => {
    opened.close();
  });
  return opened;
};
