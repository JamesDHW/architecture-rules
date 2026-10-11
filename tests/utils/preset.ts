import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect } from "vitest";

import { isRecord } from "../../src/core/guards.js";

/** presets/tsconfig.json, the file consumers extend. Tests run from the repository root. */
export const readPreset = (): Readonly<Record<string, unknown>> => {
  const preset: unknown = JSON.parse(readFileSync(resolve("presets/tsconfig.json"), "utf8"));
  return isRecord(preset) ? preset : expect.unreachable("presets/tsconfig.json holds an object");
};

export const presetCompilerOptions = (): Readonly<Record<string, unknown>> => {
  const { compilerOptions } = readPreset();
  return isRecord(compilerOptions) ? compilerOptions : expect.unreachable("the preset declares compilerOptions");
};
