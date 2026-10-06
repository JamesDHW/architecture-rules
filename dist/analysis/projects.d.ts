import { API, type Project, type Snapshot } from "typescript/unstable/sync";
import type { Architecture } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";
import type { Issue } from "./inventory.js";
export type Projects = {
    readonly api: API;
    readonly snapshot: Snapshot;
    readonly projects: readonly Project[];
    readonly sources: ReadonlySet<string>;
    readonly issues: readonly Issue[];
    readonly close: () => void;
};
/** Opens every configured TypeScript project; the caller must close() the result. */
export declare const openProjects: (rootPath: string, architecture: Architecture) => Projects | ArchitectureError;
//# sourceMappingURL=projects.d.ts.map