import type { Project } from "typescript/unstable/sync";
import type { ImportUse } from "./imports.js";
import type { ClassifiedFile } from "./inventory.js";
/** JSX compiles to an import of the JSX runtime that the source never spells out; a JSX file uses that permission too. */
export declare const jsxRuntimeUses: (file: ClassifiedFile, project: Project) => readonly ImportUse[];
//# sourceMappingURL=jsxRuntime.d.ts.map