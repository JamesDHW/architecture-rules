import { isAbsolute, relative, resolve } from "node:path";
import picomatch from "picomatch";
export const posix = (path: string): string => path.replaceAll("\\", "/");
export const relativePath = (root: string, path: string): string => posix(relative(root, path));
export const inside = (root: string, path: string): boolean => {
  const value = relative(root, path);
  return value !== ".." && !value.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) && !isAbsolute(value);
};
export const matches = (path: string, patterns: readonly string[]): boolean => patterns.some((pattern) => picomatch.isMatch(path, pattern, { dot: true }));
export const sourceFile = (path: string): boolean => /\.(?:[cm]?[jt]sx?)$/i.test(path);
export const infrastructure = (path: string): boolean => posix(path).split("/").some((part) => [".git", "node_modules", ".pnpm-store"].includes(part));
export const safePath = (root: string, path: string): string => {
  const absolute = resolve(root, path);
  if (!inside(root, absolute)) throw new Error(`Path escapes architecture root: ${path}`);
  return absolute;
};
