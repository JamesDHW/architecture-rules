import { basename } from "node:path";

import { isRecord, isString, isStringArray } from "../core/guards.js";

export type NamingPolicy = {
  readonly case: "camel" | "pascal" | "pascalOrCamel";
  readonly prefix?: string;
  /** Explicit stem suffixes, e.g. .test, .constants. Longest match wins. */
  readonly suffixes?: readonly string[];
  /** Exact filenames, e.g. page.tsx. Exempts naming only. */
  readonly allowedNames?: readonly string[];
};

export const isNamingCase = (value: unknown): value is NamingPolicy["case"] => {
  return value === "camel" || value === "pascal" || value === "pascalOrCamel";
};

const isCamelCase = (stem: string): boolean => /^[a-z][A-Za-z0-9]*$/.test(stem);

const isPascalCase = (stem: string): boolean => /^[A-Z][A-Za-z0-9]*$/.test(stem);

export const hasValidCase = (stem: string, namingCase: NamingPolicy["case"]): boolean => {
  switch (namingCase) {
    case "camel": return isCamelCase(stem);
    case "pascal": return isPascalCase(stem);
    case "pascalOrCamel": return isCamelCase(stem) || isPascalCase(stem);
  }
};

/** The longest listed suffix that name ends with; the first listed wins a tie. */
export const longestMatchingSuffix = (name: string, suffixes: readonly string[]): string | undefined => {
  const matching = suffixes.filter((suffix) => name.endsWith(suffix));
  const longestLength = Math.max(...matching.map((suffix) => suffix.length));
  return matching.find((suffix) => suffix.length === longestLength);
};

const isAbsentOr = <Value>(value: unknown, guard: (candidate: unknown) => candidate is Value): boolean => {
  return value === undefined || guard(value);
};

/** Structural counterpart of namingSchema, for options that arrive untyped. */
export const isNamingPolicy = (value: unknown): value is NamingPolicy => {
  return isRecord(value)
    && isNamingCase(value.case)
    && isAbsentOr(value.prefix, isString)
    && isAbsentOr(value.suffixes, isStringArray)
    && isAbsentOr(value.allowedNames, isStringArray);
};

export const namingError = (path: string, policy: NamingPolicy): string | undefined => {
  const name = basename(path);
  if (policy.allowedNames?.includes(name) === true) return undefined;
  const sourceStem = name.replace(/(?:\.d)?\.[cm]?[jt]sx?$/i, "");
  const suffix = longestMatchingSuffix(sourceStem, policy.suffixes ?? []);
  const stem = suffix === undefined ? sourceStem : sourceStem.slice(0, -suffix.length);
  const suffixNote = suffix === undefined ? "" : ` before ${suffix}`;
  if (!hasValidCase(stem, policy.case)) return `Filename '${name}' must use ${policy.case} case${suffixNote}.`;
  if (policy.prefix === undefined) return undefined;
  return stem.startsWith(policy.prefix) ? undefined : `Filename '${name}' must start with '${policy.prefix}'.`;
};

export const namingSchema = {
  type: "object",
  properties: {
    case: { enum: ["camel", "pascal", "pascalOrCamel"] },
    prefix: { type: "string", minLength: 1 },
    suffixes: { type: "array", items: { type: "string", minLength: 1 } },
    allowedNames: { type: "array", items: { type: "string", minLength: 1 } },
  },
  required: ["case"], additionalProperties: false,
};
