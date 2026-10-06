import { isAbsolute, relative, resolve } from "node:path";
import picomatch from "picomatch";

import { ArchitectureError } from "../errors/architectureError.js";

export const posix = (path: string): string => path.replaceAll("\\", "/");

export const relativePath = (root: string, path: string): string => posix(relative(root, path));

export const inside = (root: string, path: string): boolean => {
  const value = relative(root, path);
  return value !== ".." && !value.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) && !isAbsolute(value);
};

export const matches = (path: string, patterns: readonly string[]): boolean => {
  return patterns.some((pattern) => picomatch.isMatch(path, pattern, { dot: true }));
};

export const sourceFile = (path: string): boolean => /\.(?:[cm]?[jt]sx?)$/i.test(path);

/** Tool configuration such as vite.config.ts: tools load it from the default export. */
export const configurationFile = (path: string): boolean => /\.config\.[cm]?[jt]s$/i.test(path);

export const infrastructure = (path: string): boolean => {
  return posix(path).split("/").some((part) => [".git", "node_modules", ".pnpm-store"].includes(part));
};

/** An absolute path for a root-relative one, refusing paths that leave the root. */
export const safePath = (root: string, path: string): string | ArchitectureError => {
  const absolute = resolve(root, path);
  if (inside(root, absolute)) return absolute;
  return new ArchitectureError([`Path escapes architecture root: ${path}`]);
};
