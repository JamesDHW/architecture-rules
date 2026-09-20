import type { Architecture, ArchitectureInput } from "../architecture/types.js";
export declare const isArchitecture: (value: unknown) => value is Architecture;
/** Validate and normalize trusted configuration; filesystem checks happen in the runner. */
export declare const normalizeArchitecture: (value: unknown) => Architecture;
export declare const defineArchitecture: <const Name extends string>(config: ArchitectureInput<Name>) => Architecture;
//# sourceMappingURL=defineArchitecture.d.ts.map