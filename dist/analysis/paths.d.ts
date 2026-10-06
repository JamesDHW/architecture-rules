import { ArchitectureError } from "../errors/architectureError.js";
export declare const posix: (path: string) => string;
export declare const relativePath: (root: string, path: string) => string;
export declare const inside: (root: string, path: string) => boolean;
export declare const matches: (path: string, patterns: readonly string[]) => boolean;
export declare const sourceFile: (path: string) => boolean;
/** Tool configuration such as vite.config.ts: tools load it from the default export. */
export declare const configurationFile: (path: string) => boolean;
export declare const infrastructure: (path: string) => boolean;
/** An absolute path for a root-relative one, refusing paths that leave the root. */
export declare const safePath: (root: string, path: string) => string | ArchitectureError;
//# sourceMappingURL=paths.d.ts.map