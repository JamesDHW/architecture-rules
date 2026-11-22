import type { Projects } from "../analysis/projects.js";
import type { Architecture } from "../config/types.js";
/** --fix converts reasoned engine disable comments into exceptions before anything else is checked. */
export declare const migrateExceptions: (root: string, architecture: Architecture, opened: Projects) => Promise<number>;
//# sourceMappingURL=migrateExceptions.d.ts.map