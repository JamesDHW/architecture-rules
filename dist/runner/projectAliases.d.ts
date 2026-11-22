import type { Architecture } from "../config/types.js";
import type { ArchitectureError } from "../errors/architectureError.js";
/** One TypeScript project's path aliases, with the directory their targets are relative to, and the files it holds. */
export type ProjectAliases = {
    readonly base: string;
    readonly paths: Readonly<Record<string, readonly string[]>>;
    readonly sources: ReadonlySet<string>;
};
/** Every project's compilerOptions.paths. Targets are relative to baseUrl when it is set, else to the tsconfig. */
export declare const projectAliases: (root: string, architecture: Architecture) => Promise<readonly ProjectAliases[] | ArchitectureError>;
//# sourceMappingURL=projectAliases.d.ts.map