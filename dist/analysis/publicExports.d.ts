import type { Project } from "typescript/unstable/sync";
import type { ClassifiedFile } from "./inventory.js";
/** Whether the file is an entry: its layer is marked entry, and the entry's files (all, by default) include it. */
export declare const isEntryFile: (file: ClassifiedFile) => boolean;
/** Public exports, keyed `file:name`, or `file:*` when every export of the file is public. */
export type PublicExports = ReadonlySet<string>;
/**
 * The exports something outside the program uses: those an entry's layer names, and, through the entry's
 * re-exports, where each of them is declared. `export … from` and `export * from` are followed.
 */
export declare const publicExports: (files: readonly ClassifiedFile[], projects: readonly Project[]) => PublicExports;
export declare const isPublicExport: (exports: PublicExports, file: string, name: string) => boolean;
//# sourceMappingURL=publicExports.d.ts.map