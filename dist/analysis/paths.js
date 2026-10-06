import { isAbsolute, relative, resolve } from "node:path";
import picomatch from "picomatch";
import { ArchitectureError } from "../errors/architectureError.js";
export const posix = (path) => path.replaceAll("\\", "/");
export const relativePath = (root, path) => posix(relative(root, path));
export const inside = (root, path) => {
    const value = relative(root, path);
    return value !== ".." && !value.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) && !isAbsolute(value);
};
export const matches = (path, patterns) => {
    return patterns.some((pattern) => picomatch.isMatch(path, pattern, { dot: true }));
};
export const sourceFile = (path) => /\.(?:[cm]?[jt]sx?)$/i.test(path);
/** Tool configuration such as vite.config.ts: tools load it from the default export. */
export const configurationFile = (path) => /\.config\.[cm]?[jt]s$/i.test(path);
export const infrastructure = (path) => {
    return posix(path).split("/").some((part) => [".git", "node_modules", ".pnpm-store"].includes(part));
};
/** An absolute path for a root-relative one, refusing paths that leave the root. */
export const safePath = (root, path) => {
    const absolute = resolve(root, path);
    if (inside(root, absolute))
        return absolute;
    return new ArchitectureError([`Path escapes architecture root: ${path}`]);
};
//# sourceMappingURL=paths.js.map