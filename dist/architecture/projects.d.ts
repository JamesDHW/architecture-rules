import { API, type Project, type Snapshot } from "typescript/unstable/sync";
import type { Architecture } from "./types.js";
import type { Issue } from "./inventory.js";
export declare const compilerIssues: (architecture: Architecture, project: string, options: Record<string, unknown>) => Issue[];
export type Projects = {
    readonly api: API;
    readonly snapshot: Snapshot;
    readonly projects: readonly Project[];
    readonly sources: ReadonlySet<string>;
    readonly issues: readonly Issue[];
    readonly close: () => void;
};
export declare const openProjects: (root: string, architecture: Architecture) => Projects;
//# sourceMappingURL=projects.d.ts.map