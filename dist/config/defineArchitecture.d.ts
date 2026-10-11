import { ArchitectureError } from "../errors/architectureError.js";
import type { Architecture, ArchitectureInput } from "./types.js";
/** Validates and normalizes configuration, returning every problem at once; filesystem checks happen in the runner. */
export declare const normalizeArchitecture: (value: unknown) => Architecture | ArchitectureError;
export declare const isArchitecture: (value: unknown) => value is Architecture;
/** The configuration boundary: invalid configuration fails while architecture.config.ts loads. */
export declare const defineArchitecture: <const Layer extends string>(config: ArchitectureInput<Layer>) => Architecture;
//# sourceMappingURL=defineArchitecture.d.ts.map