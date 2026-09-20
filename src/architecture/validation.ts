import picomatch from "picomatch";
import { isAbsolute } from "node:path";
import { object } from "./schema.js";

export const fields = (input: unknown, allowed: readonly string[], label: string): Record<string, unknown> => {
  if (!object(input)) throw new Error(`${label} must be an object`);
  for (const key of Object.keys(input)) if (!allowed.includes(key)) throw new Error(`Unknown ${label} field: ${key}`);
  return input;
};
export const text = (input: unknown, label: string): string => {
  if (typeof input !== "string" || input.trim().length === 0) throw new Error(`${label} must be nonempty text`);
  return input;
};
export const strings = (input: unknown, label: string): string[] => {
  if (!Array.isArray(input)) throw new Error(`${label} must be an array`);
  return input.map((entry) => text(entry, label));
};
export const patterns = (input: unknown, label: string, exact = false): string[] => {
  const values = strings(input, label);
  for (const value of values) {
    if (isAbsolute(value) || value.startsWith("!") || value.includes("\\") || value.split("/").includes("..")) throw new Error(`${label}: expected a root-relative positive path: ${value}`);
    if (exact && /[*?{}[\]()!]/.test(value)) throw new Error(`${label}: only exact paths are permitted: ${value}`);
    picomatch(value);
  }
  return values;
};
export const freeze = <T>(value: T): T => {
  if (value !== null && typeof value === "object") {
    for (const entry of Object.values(value)) freeze(entry);
    Object.freeze(value);
  }
  return value;
};
