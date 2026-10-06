import { isAbsolute } from "node:path";
import picomatch from "picomatch";

import { isRecord, isString, isUnknownArray } from "../core/guards.js";
import { ArchitectureError } from "../errors/architectureError.js";
import { tryCatch } from "../errors/tryCatch.js";

/**
 * A normalized value plus every problem found while producing it. Invalid input
 * yields a neutral fallback value, so validation can continue and report every
 * problem in one pass instead of stopping at the first.
 */
export type Checked<Value> = { readonly value: Value; readonly issues: readonly string[] };

export const checked = <Value>(value: Value, issues: readonly string[] = []): Checked<Value> => ({ value, issues });

/** Reads an optional field: absent stays undefined, present is checked. */
export const optional = <Value>(input: unknown, read: (value: unknown) => Checked<Value>): Checked<Value | undefined> => {
  return input === undefined ? checked(undefined) : read(input);
};

export const fields = (input: unknown, allowed: readonly string[], label: string): Checked<Readonly<Record<string, unknown>>> => {
  if (!isRecord(input)) return checked({}, [`${label} must be an object`]);
  const unknownKeys = Object.keys(input).filter((key) => !allowed.includes(key));
  return checked(input, unknownKeys.map((key) => `Unknown ${label} field: ${key}`));
};

const isNonemptyText = (input: unknown): input is string => isString(input) && input.trim().length > 0;

export const text = (input: unknown, label: string): Checked<string> => {
  return isNonemptyText(input) ? checked(input) : checked("", [`${label} must be nonempty text`]);
};

export const strings = (input: unknown, label: string): Checked<readonly string[]> => {
  if (!isUnknownArray(input)) return checked([], [`${label} must be an array`]);
  const entries = input.map((entry) => text(entry, label));
  return checked(entries.map((entry) => entry.value), entries.flatMap((entry) => entry.issues));
};

const isRootRelative = (value: string): boolean => {
  return !isAbsolute(value) && !value.startsWith("!") && !value.includes("\\") && !value.split("/").includes("..");
};

const hasGlobSyntax = (value: string): boolean => /[*?{}[\]()!]/.test(value);

const patternIssues = (value: string, label: string, exact: boolean): readonly string[] => {
  if (!isRootRelative(value)) return [`${label}: expected a root-relative positive path: ${value}`];
  const isGlobInExactPath = exact && hasGlobSyntax(value);
  if (isGlobInExactPath) return [`${label}: only exact paths are permitted: ${value}`];
  const compiled = tryCatch(() => picomatch(value));
  return compiled instanceof ArchitectureError ? [`${label}: invalid pattern ${value}: ${compiled.message}`] : [];
};

export const patterns = (input: unknown, label: string, exact = false): Checked<readonly string[]> => {
  const values = strings(input, label);
  return checked(values.value, [...values.issues, ...values.value.flatMap((value) => patternIssues(value, label, exact))]);
};

const isObjectLike = (value: unknown): value is object => typeof value === "object" && value !== null;

/** Deep-freezes a normalized configuration so later code cannot change it. */
export const freeze = <Value>(value: Value): Value => {
  if (!isObjectLike(value)) return value;
  for (const entry of Object.values(value)) {
    freeze(entry);
  }
  Object.freeze(value);
  return value;
};
