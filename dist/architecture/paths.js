import { isAbsolute, relative, resolve } from "node:path";
import picomatch from "picomatch";
export const posix = (path) => path.replaceAll("\\", "/");
export const relativePath = (root, path) => posix(relative(root, path));
export const inside = (root, path) => {
    const value = relative(root, path);
    return value !== ".." && !value.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) && !isAbsolute(value);
};
export const matches = (path, patterns) => patterns.some((pattern) => picomatch.isMatch(path, pattern, { dot: true }));
export const sourceFile = (path) => /\.(?:[cm]?[jt]sx?)$/i.test(path);
export const infrastructure = (path) => posix(path).split("/").some((part) => [".git", "node_modules", ".pnpm-store"].includes(part));
export const safePath = (root, path) => {
    const absolute = resolve(root, path);
    if (!inside(root, absolute))
        throw new Error(`Path escapes architecture root: ${path}`);
    return absolute;
};
//# sourceMappingURL=paths.js.map