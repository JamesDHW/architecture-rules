import { type Projects } from "../analysis/projects.js";
import type { Architecture } from "../config/types.js";
import { ArchitectureError } from "../errors/architectureError.js";
/** Opens the TypeScript projects, runs use, and always closes them again, keeping both failures if both fail. */
export declare const withProjects: <Result>(root: string, architecture: Architecture, use: (opened: Projects) => Promise<Result | ArchitectureError>) => Promise<Result | ArchitectureError>;
//# sourceMappingURL=withProjects.d.ts.map