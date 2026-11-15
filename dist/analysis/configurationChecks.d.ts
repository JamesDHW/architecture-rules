import type { Architecture } from "../config/types.js";
import type { ImportUse } from "./imports.js";
import type { ClassifiedFile, Issue } from "./inventory.js";
/** The configuration file's root-relative path and text, so findings can point at the line they are about. */
export type ConfigText = {
    readonly file: string;
    readonly text: string;
};
/** Dependencies a layer grants that no import from the layer uses. */
export declare const unusedPermissions: (architecture: Architecture, uses: readonly ImportUse[], config: ConfigText) => readonly Issue[];
/**
 * Layer and entry patterns that match no source file of the programs. Exclude patterns are not checked: they guard
 * against files that do not exist yet. Nor are a generated layer's files, which exist only after a build.
 */
export declare const unmatchedPatterns: (architecture: Architecture, files: readonly ClassifiedFile[], config: ConfigText) => readonly Issue[];
/** Other linters' and dead-code tools' configuration in the project root. */
export declare const competingConfiguration: (root: string) => readonly Issue[];
/** The project's own TypeScript, when it has one, must be the version the checker runs. */
export declare const typescriptVersion: (root: string, checkerVersion: string) => readonly Issue[];
//# sourceMappingURL=configurationChecks.d.ts.map