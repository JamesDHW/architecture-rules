import type { ClassifiedFile } from "./inventory.js";
/** The root's own package. */
export declare const rootWorkspace = ".";
/**
 * The workspace packages that hold the files, as root-relative directories, longest first. A directory is a
 * workspace when the root's workspace patterns select it and it has a package.json.
 */
export declare const workspacesOf: (root: string, files: readonly ClassifiedFile[]) => readonly string[];
/** The workspace a root-relative path belongs to: the deepest workspace directory containing it, or the root. */
export declare const workspaceOf: (workspaces: readonly string[], relative: string) => string;
//# sourceMappingURL=workspaces.d.ts.map