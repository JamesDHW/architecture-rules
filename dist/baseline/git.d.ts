import { ArchitectureError } from "../errors/architectureError.js";
/** Runs git in the root and returns its output; a non-zero exit is an error carrying git's own message. */
export declare const git: (root: string, args: readonly string[]) => string | ArchitectureError;
/** A file's text at a revision, or undefined when it does not exist there. Paths are relative to the root. */
export declare const showAt: (root: string, revision: string, path: string) => string | undefined;
/** Stages files so the commit in progress includes them. */
export declare const stage: (root: string, paths: readonly string[]) => string | ArchitectureError;
//# sourceMappingURL=git.d.ts.map