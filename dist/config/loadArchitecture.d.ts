import { ArchitectureError } from "../errors/architectureError.js";
import type { Architecture } from "./types.js";
/** The given config path, otherwise the first conventional config in the target directory. */
export declare const configPathFor: (target: string, config?: string) => string;
/**
 * Loads and validates the default export of architecture.config.ts. A long-running caller passes a new reload
 * number to read an edited configuration; Node caches each module URL once.
 */
export declare const loadArchitecture: (configPath: string, reload?: number) => Promise<Architecture | ArchitectureError>;
//# sourceMappingURL=loadArchitecture.d.ts.map